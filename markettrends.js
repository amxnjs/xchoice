import React, { useState, useEffect } from 'react';
import { InvokeLLM } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketTrends() {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const prompt = `
        Identify current job market trends. Provide the output in the following JSON format:
        {
          "growing_fields": [
            {"field": "Field Name 1", "reason": "Brief reason for growth."},
            {"field": "Field Name 2", "reason": "Brief reason for growth."}
          ],
          "declining_fields": [
            {"field": "Field Name 1", "reason": "Brief reason for decline."},
            {"field": "Field Name 2", "reason": "Brief reason for decline."}
          ]
        }
      `;
      const result = await InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            growing_fields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
            declining_fields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setTrends(result);
    } catch (error) {
      console.error('Error fetching market trends:', error);
    }
    setLoading(false);
  };

  return (
    <Card className="border-none shadow-lg bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Job Market Pulse</CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchTrends} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5" />
                Trending Up
              </h3>
              <div className="space-y-3">
                {trends?.growing_fields?.map((item, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">{item.field}</p>
                    <p className="text-xs text-green-700">{item.reason}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5" />
                Losing Momentum
              </h3>
              <div className="space-y-3">
                {trends?.declining_fields?.map((item, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg">
                    <p className="font-medium text-red-900">{item.field}</p>
                    <p className="text-xs text-red-700">{item.reason}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
