// broadcast.ts

import { ApiPromise } from '@polkadot/api';
import connectToWsEndpoint from "./connect";
import { CHAIN_METADATA } from './metadata';
import toast from 'react-hot-toast';

/**
 * Broadcast a signed extrinsic to the chain.
 * 
 * @param {string} chain - The name of the chain (e.g. 'polkadot').
 * @param {any} signedExtrinsic - The signed extrinsic to broadcast.
 */
export async function broadcastToChain(chain: string, signedExtrinsic: any): Promise<void> {
    let api: ApiPromise;
    
    try {
        api = await connectToWsEndpoint(chain);
    } catch (error) {
        toast.error("Failed to connect to the endpoint. Please ensure you're connected and try again.");
        throw error;
    }

    return new Promise((resolve, reject) => {
        try {
            signedExtrinsic.send(({ status, events, error }) => {
                if (error) {
                    toast.error(`Transaction error: ${error.message}`);
                    reject(error);
                    return;
                }

                if (status.isInBlock) {
                    toast.success(`Transaction included at blockHash ${status.asInBlock}`);
                } else if (status.isFinalized) {
                    toast.success(`Transaction finalized at blockHash ${status.asFinalized}`);
                    resolve(); // Only resolve when the transaction is finalized
                } else if (status.isDropped || status.isInvalid || status.isUsurped) {
                    toast.error(`Error with transaction: ${status.type}`);
                    reject(new Error(status.type));
                }
            });
        } catch (error) {
            toast.error('Error broadcasting transaction:', error.message || error.toString());
            reject(error);
        }
    });
}
