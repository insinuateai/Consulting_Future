import Stripe from 'stripe'
import { requireServerEnv } from './env'

let _client: Stripe | null = null

export function stripe(): Stripe {
  if (_client) return _client
  _client = new Stripe(requireServerEnv('STRIPE_SECRET_KEY'), {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
  })
  return _client
}
