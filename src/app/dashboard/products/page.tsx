"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { blankProduct, deleteProduct, deleteSupplier, saveProduct, saveSupplier } from "@/services/productService";
import { useDemo } from "@/services/useDemo";
import type { CatalogProduct, Supplier } from "@/store/types";
import type { Unit } from "@/lib/units";

export default function ProductsPage() {
  const demo = useDemo();
  const toast = useToast();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [pending, setPending] = useState(false);

  const run = async (work: () => Promise<void>, success: string) => {
    setPending(true);
    try {
      await work();
      toast.push(success);
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not save that", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <DashboardHeader title="Products & suppliers" description="Shelf life, storage, unit, and cost feed every stock and risk figure" />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">Products</h2>
              <Button size="sm" variant="outline" onClick={() => setProduct(blankProduct(demo.suppliers[0]?.id ?? ""))}>Add</Button>
            </div>
            {demo.products.length === 0 && <p className="mt-3 text-sm text-ink-muted">No products yet.</p>}
            <ul className="mt-3 divide-y divide-mint-100">
              {demo.products.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>
                    <span className="font-medium text-ink">{item.name}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{item.storageType} · {item.shelfLifeDays} days · {item.unitCost} / {item.unit}</span>
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setProduct(item)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => void run(() => deleteProduct(item.id), "Product deleted")}>Delete</Button>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">Suppliers</h2>
              <Button size="sm" variant="outline" onClick={() => setSupplier({ id: `sup_${Date.now()}`, name: "", contact: "" })}>Add</Button>
            </div>
            <ul className="mt-3 divide-y divide-mint-100">
              {demo.suppliers.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>
                    <span className="font-medium text-ink">{item.name}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{item.contact}</span>
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setSupplier(item)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => void run(() => deleteSupplier(item.id), "Supplier deleted")}>Delete</Button>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {product && (
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h2 className="font-semibold text-ink">{product.name ? `Edit ${product.name}` : "New product"}</h2>
              <form
                className="mt-4 grid gap-3 md:grid-cols-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(async () => {
                    await saveProduct(product);
                    setProduct(null);
                  }, "Product saved");
                }}
              >
                <label className="text-sm text-ink">Name<input className="input-field mt-1" value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} /></label>
                <label className="text-sm text-ink">Category<input className="input-field mt-1" value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} /></label>
                <label className="text-sm text-ink">
                  Supplier
                  <select className="input-field mt-1" value={product.supplierId} onChange={(event) => setProduct({ ...product, supplierId: event.target.value })}>
                    {demo.suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label className="text-sm text-ink">
                  Unit
                  <select className="input-field mt-1" value={product.unit} onChange={(event) => setProduct({ ...product, unit: event.target.value as Unit })}>
                    {["g", "kg", "ml", "L", "each"].map((unit) => <option key={unit}>{unit}</option>)}
                  </select>
                </label>
                <label className="text-sm text-ink">Unit cost<input className="input-field mt-1" value={product.unitCost} onChange={(event) => setProduct({ ...product, unitCost: Number(event.target.value) })} inputMode="decimal" /></label>
                <label className="text-sm text-ink">Shelf life (days)<input className="input-field mt-1" value={product.shelfLifeDays} onChange={(event) => setProduct({ ...product, shelfLifeDays: Number(event.target.value) })} inputMode="decimal" /></label>
                <label className="text-sm text-ink">
                  Storage
                  <select className="input-field mt-1" value={product.storageType} onChange={(event) => setProduct({ ...product, storageType: event.target.value as CatalogProduct["storageType"] })}>
                    <option value="chilled">chilled</option>
                    <option value="frozen">frozen</option>
                    <option value="ambient">ambient</option>
                  </select>
                </label>
                <label className="text-sm text-ink">Default daily use<input className="input-field mt-1" value={product.defaultDailyUse} onChange={(event) => setProduct({ ...product, defaultDailyUse: Number(event.target.value) })} inputMode="decimal" /></label>
                <label className="text-sm text-ink">Confirm if value over £<input className="input-field mt-1" value={product.confirmValueThreshold} onChange={(event) => setProduct({ ...product, confirmValueThreshold: Number(event.target.value) })} inputMode="decimal" /></label>
                <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={product.freezable} onChange={(event) => setProduct({ ...product, freezable: event.target.checked })} /> Freezable</label>
                <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={product.opened} onChange={(event) => setProduct({ ...product, opened: event.target.checked })} /> Opened</label>
                <div className="flex gap-2 md:col-span-3">
                  <Button type="submit" disabled={pending}>Save product</Button>
                  <Button type="button" variant="ghost" onClick={() => setProduct(null)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        {supplier && (
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h2 className="font-semibold text-ink">Supplier</h2>
              <form
                className="mt-4 grid gap-3 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(async () => {
                    await saveSupplier(supplier);
                    setSupplier(null);
                  }, "Supplier saved");
                }}
              >
                <label className="text-sm text-ink">Name<input className="input-field mt-1" value={supplier.name} onChange={(event) => setSupplier({ ...supplier, name: event.target.value })} /></label>
                <label className="text-sm text-ink">Contact<input className="input-field mt-1" value={supplier.contact} onChange={(event) => setSupplier({ ...supplier, contact: event.target.value })} /></label>
                <div className="flex gap-2">
                  <Button type="submit" disabled={pending}>Save supplier</Button>
                  <Button type="button" variant="ghost" onClick={() => setSupplier(null)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
