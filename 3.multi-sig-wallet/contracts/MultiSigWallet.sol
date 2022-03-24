// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

contract MultiSigWallet {

    struct Transaction {
        uint idx;
        address to;
        uint value;
        bytes data;
        bool excuted;
        uint numConfirmed;
    }

    address[] public verifiers;
    mapping(address => bool) public isVerifier;
    uint public numConfirm;
    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public isConfirmed;

    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "not verifier");
        _;
    }

    modifier txExists(uint txId) {
        require(txId < transactions.length, "invalid tx ID");
        _;
    }

    modifier notExcuted(uint txId) {
        require(!transactions[txId].excuted, "tx excuted");
        _;
    }

    modifier notConfirmed(uint txId) {
        require(!isConfirmed[txId][msg.sender], "tx confirmed");
        _;
    }

    modifier confirmed(uint txId) {
        require(isConfirmed[txId][msg.sender], "tx not confirmed");
        _;
    }

    modifier confirmReached(uint txId) {
        require(transactions[txId].numConfirmed >= numConfirm, "not reached");
        _;
    }

    /* constructor
    */
    constructor(address[] memory _verifiers, uint _numConfirm) {
        require(_verifiers.length > 0, "Verifiers required");
        require(_numConfirm > 0 && _numConfirm <= _verifiers.length, "Invalid number");
        
        for (uint i = 0; i < _verifiers.length; i++) {
            require(_verifiers[i] != address(0), "!address");
            require(!isVerifier[_verifiers[i]], "address not unique");

            isVerifier[_verifiers[i]] = true;
            verifiers.push(_verifiers[i]);
        }
        numConfirm = _numConfirm;   
    }

    /* submit
    1. check onlyVerifier
    2. create a new Transaction struct,
       and append it to the transactions array.
    */
    function submit(address _to, uint _value, bytes memory _data) 
        onlyVerifier
        public 
    {
        uint txId = transactions.length;
        transactions.push(Transaction({
            idx: txId,
            to: _to,
            value: _value,
            data: _data,
            excuted: false,
            numConfirmed: 0
        }));
    }

    /* confirm
    1. check onlyVerifier
    2. check txExists
    3. check notExcuted
    4. check notConfirmed
    5. increase confirmation number and set tx confirmed.
    */
    function confirm(uint _txId) 
        onlyVerifier
        txExists(_txId)
        notExcuted(_txId)
        notConfirmed(_txId)
        public
    {
        Transaction storage transaction = transactions[_txId];
        transaction.numConfirmed++;
        isConfirmed[_txId][msg.sender] = true;
    }

    /* revoke
    1. check onlyVerifier
    2. check txExists
    3. check notConfirmed
    4. check notExcuted
    5. decrease confirmation number and set tx not confirmed.
    */
    function revoke(uint _txId)
        onlyVerifier
        txExists(_txId)
        notExcuted(_txId)
        confirmed(_txId)
        public
    {
        Transaction storage transaction = transactions[_txId];
        transaction.numConfirmed--;
        isConfirmed[_txId][msg.sender] = false;
    }

    /* excute
    1. check onlyVerifier
    2. check txExists
    3. check notExcuted
    4. check confirmation number reached
    5. call tx
    */
    function excute(uint _txId)
        txExists(_txId)
        notExcuted(_txId)
        confirmReached(_txId)
        public
    {
        Transaction storage transaction = transactions[_txId];
        transaction.excuted = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "tx failed");
    }

    function getTxCount() view public returns (uint) {
        return transactions.length;
    }

    function getTx(uint _txId) 
        txExists(_txId)
        view 
        public 
        returns (uint txId, address to, uint value, 
                bytes memory data, bool excuted, uint numConfirmed)
    {

        Transaction storage t = transactions[_txId];
        return (
            t.idx,
            t.to,
            t.value,
            t.data,
            t.excuted,
            t.numConfirmed
        );
    }
}