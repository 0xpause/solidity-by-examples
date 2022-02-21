# Hello-world  

## 知识点

### Solidity 

- 使用[Ganache](https://trufflesuite.com/docs/ganache/)运行本地区块链
- 使用[Truffle](https://trufflesuite.com/docs/truffle/)搭建Solidity开发环境 
- 使用[Truffle](https://trufflesuite.com/docs/truffle/)构建智能合约，并部署至本地区块链上 

### Frontend

- 使用[web3.js](https://web3js.readthedocs.io/en/v1.7.0/)连接MetaMask，获取账户信息，订阅账户变动信息
- 使用[web3.js](https://web3js.readthedocs.io/en/v1.7.0/)调用智能合约函数


## Solidity  

### 使用Ganache部署本地区块链  

### 使用Truffle进行Solidity开发

1. Compile  

```
truffle compile
```

2. Run tests 
```
truffle test
```

3. Deploy contracts to local chain 

    1. 实现`migrations/2_deploy_contracts.js`脚本
    2. 运行`truffle develop`启动一个local chain节点，并进入truffle交互式控制台（truffle(develop)> 提示符）
    3. 在`truffle(develop)>`控制台中输入`migrate`

- Connect MetaMask with truffle and import accounts 

    1. 在MetaMask设置中添加网络，将`truffle develop`生成的本地区块链RPC地址添加到MetaMask中
    2. 在MetaMask中导入`truffle develop`生成的账号私钥

## Frontend 

1. 安装creat-react-app
```
npm i -g create-react-app
```

2. 进入工作目录，创建项目
```
npx create-react-app hello-world
cd hello-world
npm start
```

3. 安装依赖
```
npm i semantic-ui-css semantic-ui-react 
npm i web3 bn.js
```

4. 导入Solidity构建文件

    将truffle solidity项目中的build/目录中包含合约的ABI信息和部署信息，将整个build/目录拷贝至src/目录下。