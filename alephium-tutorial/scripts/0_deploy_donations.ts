import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { Donations } from '../artifacts/ts'
import { CallContractParams } from '@alephium/web3'
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

  const params: CallContractParams<{ donor: string }> = {
    args: { donor: address.address }
  }

  // Balance before call
  const contract = result.contractInstance
  let getDonationBal = await contract.view.getDonorTotal(params)
  console.log(getDonationBal.returns)

  const params2: CallContractParams<{ recipient: string; amount: bigint }> = {
    args: { recipient: address.address, amount: 10n }
  }

  // Depositing donation
  await contract.view.depositToUser(params2)

  // Balance after call
  getDonationBal = await contract.view.getDonorTotal(params)
  console.log(getDonationBal.returns)
}

export default deployFaucet
