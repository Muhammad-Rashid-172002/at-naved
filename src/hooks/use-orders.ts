"use client";

import { useCallback, useEffect, useState } from "react";
import { getRepo } from "@/lib/data";
import type { Customer, Order } from "@/lib/types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setOrders(await getRepo().listOrders());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    const unsub = getRepo().subscribe("orders", () => void reload());
    const t = setInterval(() => void reload(), 30000);
    return () => {
      unsub();
      clearInterval(t);
    };
  }, [reload]);

  return { orders, loading, error, reload };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      getRepo()
        .listCustomers()
        .then((c) => alive && (setCustomers(c), setError(null)))
        .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Could not load customers."))
        .finally(() => alive && setLoading(false));
    void load();
    const unsub = getRepo().subscribe("orders", () => void load());
    return () => {
      alive = false;
      unsub();
    };
  }, []);
  return { customers, loading, error };
}

/** Live single-order view for confirmation/tracking pages. */
export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      getRepo()
        .getOrder(id)
        .then((o) => alive && (setOrder(o), setError(null)))
        .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Could not load the order."))
        .finally(() => alive && setLoading(false));
    void load();
    const unsub = getRepo().subscribe("orders", () => void load());
    const t = setInterval(() => void load(), 10000);
    return () => {
      alive = false;
      unsub();
      clearInterval(t);
    };
  }, [id]);
  return { order, loading, error };
}
