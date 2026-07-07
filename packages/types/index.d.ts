export interface Brand { id: number; name: string; }
export interface Manufacturer { id: number; name: string; }
export interface Model { id: number; brand_id: number; name: string; year?: number }
export interface Motorcycle { id: number; model_id: number; trim?: string; engine?: string }
export interface Assembly { id: number; motorcycle_id: number; name: string }
export interface Part { id: number; sku?: string; name: string; manufacturer_id?: number; assembly_id?: number; description?: string }
export interface PartImage { id: number; part_id: number; url: string; metadata?: any }
export interface EquivalentPart { id: number; part_id: number; equivalent_part_id: number; note?: string }
export interface Compatibility { id: number; part_id: number; motorcycle_id: number; note?: string }
export interface User { id: string; email: string; name?: string; role?: string }
export interface Subscription { id: number; user_id: string; plan?: string }
