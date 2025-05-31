"use client";
import React, { useState, useEffect } from "react";
import freighterApi from "@stellar/freighter-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wallet, Key, Transfer, Shield, Clock, CheckCircle } from "lucide-react";

interface AccessKey {
  id: string;
  name: string;
  price: string;
  duration: string;
  active: boolean;
  expiresAt?: Date;
}

export default function DigitalContentAccessKeys() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'mint' | 'transfer' | 'balance'>('mint');
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>([]);
  
  // Form states
  const [mintForm, setMintForm] = useState({
    name: '',
    price: '',
    duration: '30'
  });
  
  const [transferForm, setTransferForm] = useState({
    keyId: '',
    recipient: '',
    price: ''
  });

  // Cüzdan bağlantısını kontrol et
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const connected = await freighterApi.isConnected();
        if (connected) {
          const { address } = await freighterApi.getAddress();
          setPublicKey(address);
          loadAccessKeys(address);
        }
      } catch (error) {
        console.error("Error checking Freighter connection:", error);
      }
    };
    checkFreighter();
  }, []);

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      await freighterApi.setAllowed();
      const { address } = await freighterApi.getAddress();
      setPublicKey(address);
      await loadAccessKeys(address);
    } catch (error) {
      console.error("Error connecting to Freighter:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccessKeys = async (address: string) => {
    // Gerçek uygulamada Stellar ağından veri çekilecek
    // Şimdilik mock data kullanıyoruz
    const mockKeys: AccessKey[] = [
      {
        id: "key_1",
        name: "Premium Content Pack",
        price: "10",
        duration: "30",
        active: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: "key_2",
        name: "Basic Access",
        price: "5",
        duration: "7",
        active: false
      }
    ];
    setAccessKeys(mockKeys);
  };

  const handleMintKey = async () => {
    if (!publicKey || !mintForm.name || !mintForm.price) return;
    
    try {
      setLoading(true);
      // Burada Soroban smart contract'ı çağrılacak
      console.log("Minting key:", mintForm);
      
      // Mock yeni anahtar ekleme
      const newKey: AccessKey = {
        id: `key_${Date.now()}`,
        name: mintForm.name,
        price: mintForm.price,
        duration: mintForm.duration,
        active: true,
        expiresAt: new Date(Date.now() + parseInt(mintForm.duration) * 24 * 60 * 60 * 1000)
      };
      
      setAccessKeys(prev => [...prev, newKey]);
      setMintForm({ name: '', price: '', duration: '30' });
      
    } catch (error) {
      console.error("Error minting key:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferKey = async () => {
    if (!publicKey || !transferForm.keyId || !transferForm.recipient) return;
    
    try {
      setLoading(true);
      // Burada Soroban smart contract'ı çağrılacak
      console.log("Transferring key:", transferForm);
      
      // Mock transfer
      setAccessKeys(prev => 
        prev.map(key => 
          key.id === transferForm.keyId 
            ? { ...key, active: false }
            : key
        )
      );
      setTransferForm({ keyId: '', recipient: '', price: '' });
      
    } catch (error) {
      console.error("Error transferring key:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeAccount = async (keyId: string) => {
    try {
      setLoading(true);
      // Burada Soroban smart contract'ı çağrılacak
      console.log("Freezing key:", keyId);
      
      setAccessKeys(prev => 
        prev.map(key => 
          key.id === keyId 
            ? { ...key, active: false }
            : key
        )
      );
      
    } catch (error) {
      console.error("Error freezing key:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Digital Content Access Keys</CardTitle>
            <p className="text-slate-400">Stellar Soroban üzerinde dijital içerik erişim anahtarlarınızı yönetin</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleConnectWallet}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {loading ? "Bağlanıyor..." : "Freighter Cüzdanını Bağla"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center">
              <Key className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Digital Content Access Keys</h1>
                <p className="text-slate-400">Stellar Soroban DApp</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Cüzdan Adresi</p>
              <p className="text-sm font-mono text-white">
                {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
            {[
              { id: 'mint', label: 'Mint Keys', icon: Key },
              { id: 'transfer', label: 'Transfer', icon: Transfer },
              { id: 'balance', label: 'My Keys', icon: Shield }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'mint' && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Key className="w-5 h-5 mr-2 text-purple-400" />
                    Yeni Erişim Anahtarı Oluştur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      İçerik Adı
                    </label>
                    <Input
                      value={mintForm.name}
                      onChange={(e) => setMintForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Premium Video Kursu"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Fiyat (XLM)
                      </label>
                      <Input
                        type="number"
                        value={mintForm.price}
                        onChange={(e) => setMintForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="10"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Süre (Gün)
                      </label>
                      <Input
                        type="number"
                        value={mintForm.duration}
                        onChange={(e) => setMintForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="30"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleMintKey}
                    disabled={loading || !mintForm.name || !mintForm.price}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Erişim Anahtarı Oluştur
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'transfer' && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Transfer className="w-5 h-5 mr-2 text-purple-400" />
                    Erişim Anahtarı Transfer Et
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Anahtar Seç
                    </label>
                    <select
                      value={transferForm.keyId}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, keyId: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
                    >
                      <option value="">Bir anahtar seçin</option>
                      {accessKeys.filter(key => key.active).map(key => (
                        <option key={key.id} value={key.id}>
                          {key.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Alıcı Adresi
                    </label>
                    <Input
                      value={transferForm.recipient}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, recipient: e.target.value }))}
                      placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Satış Fiyatı (XLM) - Opsiyonel
                    </label>
                    <Input
                      type="number"
                      value={transferForm.price}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button 
                    onClick={handleTransferKey}
                    disabled={loading || !transferForm.keyId || !transferForm.recipient}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Transfer Et
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'balance' && (
              <div className="space-y-4">
                {accessKeys.map(key => (
                  <Card key={key.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Key className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{key.name}</h3>
                            <p className="text-sm text-slate-400">{key.price} XLM • {key.duration} gün</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={key.active ? "default" : "secondary"}
                            className={key.active ? "bg-green-600" : "bg-slate-600"}
                          >
                            {key.active ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aktif
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Pasif
                              </>
                            )}
                          </Badge>
                          {key.active && (
                            <Button
                              onClick={() => handleFreezeAccount(key.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              Dondur
                            </Button>
                          )}
                        </div>
                      </div>
                      {key.expiresAt && key.active && (
                        <div className="mt-2 text-sm text-slate-400">
                          Bitiş: {key.expiresAt.toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {accessKeys.length === 0 && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="text-center py-8">
                      <Key className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Henüz erişim anahtarınız bulunmuyor</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">İstatistikler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Toplam Anahtar</span>
                  <span className="text-white font-semibold">{accessKeys.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Aktif Anahtar</span>
                  <span className="text-green-400 font-semibold">
                    {accessKeys.filter(k => k.active).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pasif Anahtar</span>
                  <span className="text-red-400 font-semibold">
                    {accessKeys.filter(k => !k.active).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Özellikler</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Erişim anahtarı oluşturma
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Anahtar transfer etme
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Abonelik durumu kontrol
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Hesap dondurma
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}