import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { Donations } from '../artifacts/ts'
import { CallContractParams, ONE_ALPH } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-test'

const deployFaucet: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  // Get settings
  const issueTokenAmount = network.settings.issueTokenAmount
  const result = await deployer.deployContract(Donations, {
    // The amount of token to be issued
    issueTokenAmount: issueTokenAmount,
    // The initial states of the faucet contract
    initialFields: {}
  })
  console.log('Token faucet contract id: ' + result.contractInstance.contractId)
  console.log('Token faucet contract address: ' + result.contractInstance.address)

  const signer = await testNodeWallet()
  const addresses = await signer.getAccounts()
  const address = addresses[0]
  const address2 = addresses[1]

  const params: CallContractParams<{ donor: string }> = {
    args: { donor: address.address }
  }

  // Balance before call
  const contract = result.contractInstance
  let getDonationBal = await contract.view.getDonorTotal(params)
  console.log(`Balance Before: ${Number(getDonationBal.returns)}`)

  // Depositing donation
  await contract.transact.depositToUser({
    signer,
    args: { recipient: address.address, amount: BigInt(10000) },
    attoAlphAmount: ONE_ALPH * BigInt(2)
  })

  // Balance after call
  getDonationBal = await contract.view.getDonorTotal(params)
  console.log(`Balance After: ${Number(getDonationBal.returns)}`)
}

export default deployFaucet
