import 'server-only'
import fs from 'fs'
import path from 'path'
import type { Product } from '@/types/product'
import { createSupabaseClient } from './supabase'

const productsPath = path.join(process.cwd(), 'data', 'products.json')

function readJsonProducts(): Product[] {
  try {
    const raw = fs.readFileSync(productsPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeJsonProducts(products: Product[]): void {
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf-8')
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export async function readProducts(): Promise<Product[]> {
  const supabase = createSupabaseClient()
  if (!supabase) return readJsonProducts()

  const { data, error } = await supabase.from('products').select('*').order('name')

  if (error) {
    console.error('[Supabase] Error al leer productos:', error.message)
    return readJsonProducts()
  }

  return data as Product[]
}

export async function writeProducts(products: Product[]): Promise<void> {
  const supabase = createSupabaseClient()
  if (!supabase) {
    writeJsonProducts(products)
    return
  }

  const { error: deleteError } = await supabase.from('products').delete().neq('id', '')
  if (deleteError) {
    console.error('[Supabase] Error al limpiar productos:', deleteError.message)
    return
  }

  const { error: insertError } = await supabase.from('products').insert(
    products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image || '',
      category: p.category,
      description: p.description || '',
      rating: p.rating || 0,
      stock: p.stock || 0,
    }))
  )

  if (insertError) {
    console.error('[Supabase] Error al insertar productos:', insertError.message)
  }
}

export async function addProduct(product: Product): Promise<Product | null> {
  const supabase = createSupabaseClient()
  if (!supabase) {
    const products = readJsonProducts()
    products.push(product)
    writeJsonProducts(products)
    return product
  }

  const { data, error } = await supabase.from('products').insert({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image || '',
    category: product.category,
    description: product.description || '',
    rating: product.rating || 0,
    stock: product.stock || 0,
  }).select().single()

  if (error) {
    console.error('[Supabase] Error al crear producto:', error.message)
    return null
  }

  return data as Product
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const supabase = createSupabaseClient()
  if (!supabase) {
    const products = readJsonProducts()
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return null
    products[index] = { ...products[index], ...updates }
    writeJsonProducts(products)
    return products[index]
  }

  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()

  if (error) {
    console.error('[Supabase] Error al actualizar producto:', error.message)
    return null
  }

  return data as Product
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createSupabaseClient()
  if (!supabase) {
    const products = readJsonProducts()
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return false
    products.splice(index, 1)
    writeJsonProducts(products)
    return true
  }

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    console.error('[Supabase] Error al eliminar producto:', error.message)
    return false
  }

  return true
}
