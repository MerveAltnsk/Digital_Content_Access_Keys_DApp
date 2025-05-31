"use client";

import React, { useEffect, useState } from "react";
import freighterApi from "@stellar/freighter-api";
import { Key, Users, CreditCard, Lock, Shield, Zap } from "lucide-react";

export default function HomePage() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [accessKeys, setAccessKeys] = useState<any[]>([]);

  // Check if wallet is connected on page load
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const connected = await freighterApi.isConnected();
        if (connected) {
          const address = await freighterApi.getPublicKey();
          setPublicKey(address);
          // Load user data
          await loadUserData(address);
        }
      } catch (error) {
        console.error("Error checking Freighter connection:", error);
      }
    };

    checkFreighter();
  }, []);

  // Handle wallet connect button click
  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      await freighterApi.setAllowed();
      const address = await freighterApi.getPublicKey();
      setPublicKey(address);
      await loadUserData(address);
    } catch (error) {
      console.error("Error connecting to Freighter:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (address: string) => {
    // Mock data for demo - replace with actual contract calls
    setBalance(10);
    setAccessKeys([
      { id: 1, name: "Premium Video Course", expires: "2025-12-31", active: true },
      { id: 2, name: "Music Collection", expires: "2025-06-30", active: true },
    ]);
  };

  const handleMintKey = async () => {
    if (!publicKey) return;
    setIsLoading(true);
    try {
      // Add your Soroban contract interaction here
      console.log("Minting access key...");
      // Mock success
      setTimeout(() => {
        setAccessKeys([...accessKeys, { 
          id: Date.now(), 
          name: "New Access Key", 
          expires: "2026-01-01", 
          active: true 
        }]);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error minting key:", error);
      setIsLoading(false);
    }
  };

  const handleTransferKey = async (keyId: number) => {
    setIsLoading(true);
    try {
      // Add your Soroban contract interaction here
      console.log("Transferring key:", keyId);
      // Mock success
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error transferring key:", error);
      setIsLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mb-8">
              <Shield className="w-24 h-24 mx-auto text-cyan-400 mb-6" />
              <h1 className="text-5xl font-bold text-white mb-4">
                Digital Content Access Keys
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Secure, decentralized access management for digital content using Stellar blockchain
              </p>
            </div>
            
            <div className="max-w-md mx-auto bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Connect Your Wallet</h2>
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  "Connect Freighter Wallet"
                )}
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <Key className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Mint Access Keys</h3>
                <p className="text-gray-300">Create secure digital access tokens for your content</p>
              </div>
              <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <Users className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Transfer & Share</h3>
                <p className="text-gray-300">Easily transfer or sell access rights to others</p>
              </div>
              <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <Lock className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Manage Access</h3>
                <p className="text-gray-300">Control subscription status and account permissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-cyan-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Digital Access Keys</h1>
          </div>
          <div className="bg-black/20 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/10">
            <p className="text-sm text-gray-300">Connected:</p>
            <p className="text-cyan-400 font-mono text-sm">
              {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Access Keys Balance</p>
                <p className="text-3xl font-bold text-white">{balance}</p>
              </div>
              <CreditCard className="w-12 h-12 text-cyan-400" />
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Keys</p>
                <p className="text-3xl font-bold text-white">{accessKeys.filter(k => k.active).length}</p>
              </div>
              <Key className="w-12 h-12 text-green-400" />
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Keys</p>
                <p className="text-3xl font-bold text-white">{accessKeys.length}</p>
              </div>
              <Users className="w-12 h-12 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleMintKey}
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Mint New Access Key
            </button>
            <button
              onClick={() => console.log("Check balance")}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <CreditCard className="w-5 h-5 inline mr-2" />
              Check Balance
            </button>
          </div>
        </div>

        {/* Access Keys List */}
        <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Your Access Keys</h2>
          <div className="space-y-4">
            {accessKeys.map((key) => (
              <div key={key.id} className="bg-black/30 rounded-lg p-4 border border-white/5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{key.name}</h3>
                    <p className="text-gray-300 text-sm">Expires: {key.expires}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      key.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {key.active ? 'Active' : 'Expired'}
                    </span>
                    <button
                      onClick={() => handleTransferKey(key.id)}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {accessKeys.length === 0 && (
              <div className="text-center py-8">
                <Key className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No access keys found. Mint your first key to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}