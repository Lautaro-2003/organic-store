import 'server-only'
import fs from 'fs'
import path from 'path'
import type { Product } from '@/types/product'

const productsPath = path.join(process.cwd(), 'data', 'products.json')

export function readProducts(): Product[] {
  try {
    const raw = fs.readFileSync(productsPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function writeProducts(products: Product[]): void {
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf-8')
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
