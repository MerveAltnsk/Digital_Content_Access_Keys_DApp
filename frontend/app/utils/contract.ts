import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  Address,
} from "@stellar/stellar-sdk";
import freighterApi from "@stellar/freighter-api";


type SimulateTransactionSuccessResponseType = {
  results: {
    retval: any;
  }[];
};

function isSimulateTransactionSuccessResponse(
  response: any
): response is SimulateTransactionSuccessResponseType {
  return response && Array.isArray(response.results);
}

// Example usage (move this after server is declared and initialized):
// const result = await server.simulateTransaction(tx);
// if (isSimulateTransactionSuccessResponse(result)) {
//   const retval = result.results[0]?.retval;
//   if (retval) {
//     return parseInt(retval.toString());
//   }
// }

// Contract configuration
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE"; // Replace with deployed contract address
const NETWORK_PASSPHRASE = Networks.TESTNET; // Use Networks.PUBLIC for mainnet
const RPC_URL = "https://soroban-testnet.stellar.org";

// Initialize RPC server
const server = new SorobanRpc.Server(RPC_URL);

// Contract interface
export interface AccessKey {
  id: bigint;
  owner: string;
  content_id: string;
  expires_at: bigint;
  is_active: boolean;
  transferable: boolean;
}

export interface ContentMetadata {
  title: string;
  description: string;
  creator: string;
  price: bigint;
  max_keys: number;
}

// Contract interaction class
export class DigitalAccessKeysContract {
  private contract: Contract;

  constructor() {
    this.contract = new Contract(CONTRACT_ADDRESS);
  }

  // Get user's public key from Freighter
  private async getUserPublicKey(): Promise<string> {
    const address = await freighterApi.getPublicKey();
    return address;
  }

  // Build and submit transaction
  private async buildAndSubmitTransaction(operation: xdr.Operation): Promise<string> {
    const userPublicKey = await this.getUserPublicKey();
    const account = await server.getAccount(userPublicKey);
    
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(300)
      .build();

    const preparedTransaction = await server.prepareTransaction(transaction);
    const signedXDR = await freighterApi.signTransaction(
      preparedTransaction.toXDR(),
      {
        networkPassphrase: NETWORK_PASSPHRASE,
      }
    );

    const signedTransaction = TransactionBuilder.fromXDR(
      signedXDR,
      NETWORK_PASSPHRASE
    );

    const transactionResult = await server.sendTransaction(signedTransaction);
    
    if (transactionResult.status === "PENDING") {
      let txResponse = await server.getTransaction(transactionResult.hash);
      while (txResponse.status === "NOT_FOUND") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        txResponse = await server.getTransaction(transactionResult.hash);
      }
      
      if (txResponse.status === "SUCCESS") {
        return transactionResult.hash;
      } else {
        throw new Error(`Transaction failed: ${txResponse.status}`);
      }
    } else {
      throw new Error(`Transaction submission failed: ${transactionResult.status}`);
    }
  }

  // Contract methods
  async mint(
    to: string,
    contentId: string,
    expiresAt: number,
    transferable: boolean
  ): Promise<string> {
    const operation = this.contract.call(
      "mint",
      new Address(to).toScVal(),
      xdr.ScVal.scvString(contentId),
      xdr.ScVal.scvU64(xdr.Uint64.fromString(expiresAt.toString())),
      xdr.ScVal.scvBool(transferable)
    );

    return await this.buildAndSubmitTransaction(operation);
  }

  async transfer(keyId: number, to: string): Promise<string> {
    const operation = this.contract.call(
      "transfer",
      xdr.ScVal.scvU64(xdr.Uint64.fromString(keyId.toString())),
      new Address(to).toScVal()
    );

    return await this.buildAndSubmitTransaction(operation);
  }

  async getBalance(address: string): Promise<number> {
  try {
    const result = await server.simulateTransaction(
      new TransactionBuilder(
        await server.getAccount(address),
        {
          fee: BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(
          this.contract.call(
            "balance",
            new Address(address).toScVal()
          )
        )
        .setTimeout(300)
        .build()
    );

if (isSimulateTransactionSuccessResponse(result)) {
  const retval = (result as unknown as SimulateTransactionSuccessResponseType).results[0]?.retval;
  if (retval) {
    return parseInt(retval.toString());
  }
}


    return 0;
  } catch (error) {
    console.error("Error getting balance:", error);
    return 0;
  }
}

 

  async isFrozen(account: string): Promise<boolean> {
  try {
    const result = await server.simulateTransaction(
      new TransactionBuilder(
        await server.getAccount(account),
        {
          fee: BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(
          this.contract.call(
            "is_frozen",
            new Address(account).toScVal()
          )
        )
        .setTimeout(300)
        .build()
    );

    if (isSimulateTransactionSuccessResponse(result)) {
      const retval = result.results[0]?.retval;
      return retval?.toString() === "true";
    }
    return false;
  } catch (error) {
    console.error("Error checking frozen status:", error);
    return false;
  }
}

 async getKey(keyId: number): Promise<AccessKey | null> {
  try {
    const userPublicKey = await this.getUserPublicKey();
    const result = await server.simulateTransaction(
      new TransactionBuilder(
        await server.getAccount(userPublicKey),
        {
          fee: BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(
          this.contract.call(
            "get_key",
            xdr.ScVal.scvU64(xdr.Uint64.fromString(keyId.toString()))
          )
        )
        .setTimeout(300)
        .build()
    );

    if (isSimulateTransactionSuccessResponse(result)) {
      const retval = result.results[0]?.retval;
      // Parse the retval - this would need proper ScVal parsing
      // For now, returning null as placeholder
      return null;
    }
    return null;
  } catch (error) {
    console.error("Error getting key:", error);
    return null;
  }
}
 async getUserKeys(user: string): Promise<number[]> {
  try {
    const result = await server.simulateTransaction(
      new TransactionBuilder(
        await server.getAccount(user),
        {
          fee: BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(
          this.contract.call(
            "get_user_keys",
            new Address(user).toScVal()
          )
        )
        .setTimeout(300)
        .build()
    );

    if (isSimulateTransactionSuccessResponse(result)) {
      // Parse the vector result - this would need proper ScVal parsing
      // For now, returning empty array as placeholder
      return [];
    }
    return [];
  } catch (error) {
    console.error("Error getting user keys:", error);
    return [];
  }
}


async isKeyValid(keyId: number): Promise<boolean> {
  try {
    const userPublicKey = await this.getUserPublicKey();
    const result = await server.simulateTransaction(
      new TransactionBuilder(
        await server.getAccount(userPublicKey),
        {
          fee: BASE_FEE,
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(
          this.contract.call(
            "is_key_valid",
            xdr.ScVal.scvU64(xdr.Uint64.fromString(keyId.toString()))
          )
        )
        .setTimeout(300)
        .build()
    );

    if (isSimulateTransactionSuccessResponse(result)) {
      const retval = result.results[0]?.retval;
      return retval?.toString() === "true";
    }
    return false;
  } catch (error) {
    console.error("Error checking key validity:", error);
    return false;
  }
}

  async setContentMetadata(
    contentId: string,
    title: string,
    description: string,
    creator: string,
    price: number,
    maxKeys: number
  ): Promise<string> {
    const operation = this.contract.call(
      "set_content_metadata",
      xdr.ScVal.scvString(contentId),
      xdr.ScVal.scvString(title),
      xdr.ScVal.scvString(description),
      new Address(creator).toScVal(),
      xdr.ScVal.scvI64(xdr.Int64.fromString(price.toString())),
      xdr.ScVal.scvU32(maxKeys)
    );

    return await this.buildAndSubmitTransaction(operation);
  }
}

// Export contract instance
export const contractInstance = new DigitalAccessKeysContract();