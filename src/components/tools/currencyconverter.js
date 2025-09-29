import React, { useState } from 'react';
import { InvokeLLM } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/Combobox';
import { ArrowLeftRight, Loader2, DollarSign } from 'lucide-react';

const currencies = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'CNY', label: 'CNY - Chinese Yuan' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'KRW', label: 'KRW - South Korean Won' },
    { value: 'SGD', label: 'SGD - Singapore Dollar' },
    { value: 'CHF', label: 'CHF - Swiss Franc' },
    { value: 'SEK', label: 'SEK - Swedish Krona' },
    { value: 'NOK', label: 'NOK - Norwegian Krone' },
    { value: 'DKK', label: 'DKK - Danish Krone' },
    { value: 'NZD', label: 'NZD - New Zealand Dollar' },
    { value: 'ZAR', label: 'ZAR - South African Rand' },
    { value: 'BRL', label: 'BRL - Brazilian Real' },
    { value: 'MXN', label: 'MXN - Mexican Peso' },
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
];

export default function CurrencyConverter() {
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleConvert = async () => {
        if (!amount || !fromCurrency || !toCurrency) return;
        
        setLoading(true);
        try {
            const prompt = `
                Convert ${amount} ${fromCurrency} to ${toCurrency} using current exchange rates.
                
                Return the result in this exact JSON format:
                {
                    "converted_amount": 1234.56,
                    "exchange_rate": 0.85,
                    "from_currency": "USD",
                    "to_currency": "EUR",
                    "original_amount": 1000
                }
                
                Use accurate, real-time exchange rates from financial sources.
            `;
            
            const response = await InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        converted_amount: { type: 'number' },
                        exchange_rate: { type: 'number' },
                        from_currency: { type: 'string' },
                        to_currency: { type: 'string' },
                        original_amount: { type: 'number' }
                    },
                    required: ['converted_amount', 'exchange_rate', 'from_currency', 'to_currency', 'original_amount']
                }
            });
            
            setResult(response);
        } catch (error) {
            console.error('Currency conversion failed:', error);
        }
        setLoading(false);
    };

    const swapCurrencies = () => {
        const temp = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(temp);
        setResult(null);
    };

    return (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                    <DollarSign className="w-5 h-5" />
                    Currency Converter
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Convert tuition costs to your local currency
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Amount</label>
                        <Input
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-lg"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">From</label>
                            <Combobox
                                options={currencies}
                                value={fromCurrency}
                                onValueChange={setFromCurrency}
                                placeholder="Select currency"
                            />
                        </div>
                        
                        <div className="flex justify-center pb-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={swapCurrencies}
                                className="hover:bg-blue-100"
                            >
                                <ArrowLeftRight className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">To</label>
                            <Combobox
                                options={currencies}
                                value={toCurrency}
                                onValueChange={setToCurrency}
                                placeholder="Select currency"
                            />
                        </div>
                    </div>
                </div>
                
                <Button
                    onClick={handleConvert}
                    disabled={loading || !amount || !fromCurrency || !toCurrency}
                    className="w-full bg-green-600 hover:bg-green-700"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Converting...
                        </>
                    ) : (
                        'Convert Currency'
                    )}
                </Button>
                
                {result && (
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-800">
                                {result.converted_amount.toLocaleString()} {result.to_currency}
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                {result.original_amount.toLocaleString()} {result.from_currency} = {result.converted_amount.toLocaleString()} {result.to_currency}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Exchange rate: 1 {result.from_currency} = {result.exchange_rate.toFixed(4)} {result.to_currency}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}