import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { Donations } from '../artifacts/ts'
import { CallContractParams, ONE_ALPH } from '@alephium/web3'
import { testNodeWallet } from '@alephium/web3-test'

const deployContract: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  const issueTokenAmount = network.settings.issueTokenAmount
  const result = await deployer.deployContract(Donations, {
    issueTokenAmount,
    initialFields: {
      symbol: Buffer.from('DTN', 'utf8').toString('hex'),
      name: Buffer.from('Donation Token', 'utf8').toString('hex'),
      decimals: 18n,
      supply: issueTokenAmount,
      balance: issueTokenAmount
    }
  })

  console.log('Contract id: ' + result.contractInstance.contractId)
  console.log('Contract address: ' + result.contractInstance.address)

  const signer = await testNodeWallet()
  const addresses = await signer.getAccounts()
  // const address = addresses[0]
  const address = addresses[1]

  const amount = BigInt(10) // ALPH tokens

  const params: CallContractParams<{ donor: string }> = {
    args: { donor: address.address }
  }

  // Balance before call
  const contract = result.contractInstance
  let getDonationBal = await contract.view.getDonorTotal(params)

  console.log('////')
  console.log(address.address)
  console.log(`Contract Balance Before: ${Number(getDonationBal.returns)}`)

  // Depositing donation
  await contract.transact.depositToUser({
    signer,
    args: { recipient: address.address, amount },
    attoAlphAmount: ONE_ALPH * amount
  })

  // Balance after call
  getDonationBal = await contract.view.getDonorTotal(params)

  console.log('////')
  console.log(address.address)
  console.log(`Contract Balance Before: ${Number(getDonationBal.returns)}`)
}

export default deployContract
