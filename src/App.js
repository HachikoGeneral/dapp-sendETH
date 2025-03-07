import React, {useEffect, useState} from "react"
import Web3 from "web3"
import Chains from "./chains/chains.json"
import TokenDapp from './components/TokenDapp'
import './App.css';

function App() {

  const [isConnectedWeb3, setIsConnectedWeb3] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [balance, setBalance] = useState(0)
  const [web3] = useState(new Web3(Web3.givenProvider || "wss://bscrpc.com"))
  const [weiToSend, setWeiToSend] = useState(0)
  const [addressToSend, setAddressToSend] = useState("")
  const [chainId, setChainId] = useState({})
  const [isMined, setIsMined] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
 

  const connectToWeb3 =
  async () => {
    if(window.ethereum) {
      try {
        await window.ethereum.request({method: 'eth_requestAccounts'})

        setIsConnectedWeb3(true)
      } catch (err) {
        console.error(err)
      }
    } else {
      alert("Install Metamask")
    }
  }                
  const idChain = async () => {

    let currentChain = await web3.eth.getChainId()
    for (let index = 0; index < Chains.length; index++) {
      if (currentChain === Chains[index].networkId) {
        setChainId({ ...Chains[index]})
        break;
      }
    }
  }

  useEffect(() => {
    // Accounts
    const getAccounts = async () => setAccounts(await web3.eth.getAccounts())
    const getBalance = async () => setBalance(await web3.eth.getBalance(accounts[0]))

    if (accounts.length === 0) getAccounts()
    if (accounts.length > 0) {
      getBalance() 
      idChain()
    }
    

  }, [isConnectedWeb3, accounts, chainId, web3])
  
  const sendEth=
    async () => {

    if(web3.utils.isAddress) {

            try {
                    setIsLoading(true)
                    await web3.eth.sendTransaction({ from: accounts[0], to: addressToSend, value: web3.utils.toWei(weiToSend.toString())}) 
                    .on('receipt', () => {
                    setIsLoading(false)
                    setIsMined(true)
                    })
                }
                catch(error){
                    setIsLoading(null)
                    alert("Wrong Address")
                }
        }
    }

 

  return (
    <div className="App-flex">
      <div className="send-column">
            <div>
                <h1>Wallet App</h1>
                <p>Amount {chainId.chain} : {web3.utils.fromWei(balance.toString())} { chainId.shortName}</p> 
                <label>Address </label><input type="text" value={addressToSend} onChange={(e)=> setAddressToSend(e.target.value)}></input> 
                <br/><br/>
            
                <label>Amount </label> <input type="number" value={weiToSend} onChange={(e)=> setWeiToSend(e.target.value)}></input>
                <br/><br/>
                {weiToSend >0 && addressToSend ?
                  <button onClick={sendEth}>Envoyer</button> : <button disabled="disabled">Envoyer</button>
                }
                {isLoading ? 
                <p>Loading...</p> : !isLoading && isMined ? <p>Transaction succes</p> : null
                }
            </div>
            <TokenDapp accounts={accounts} chainId={chainId} isConnectedWeb3={isConnectedWeb3}/>
      </div>
            <div className="connect">
              <p>{chainId.name}</p>
                {
                  isConnectedWeb3
                    ? <p>Connected : <a href={`${chainId.explorers[0].url}/address/${accounts[0]}` } target="_blank" rel="noreferrer">My address</a></p>
                    : <button onClick={connectToWeb3}>Connect to web3</button>
                    }
            </div>
                                               
    </div>
  );
}

export default App;
