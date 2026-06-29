package com.gateway.cache;

import java.util.LinkedHashMap;
import java.util.Map;

public class LRUCache<K, V> {

    private final int maxSize;
    private final Map<K, V> map;

    public LRUCache(int maxSize) {
        this.maxSize = maxSize;
        // TODO: init LinkedHashMap in access-order mode, override removeEldestEntry
        this.map = new LinkedHashMap<>();
    }

    public synchronized V get(K key) {
        // TODO
        return null;
    }

    public synchronized void put(K key, V value) {
        // TODO
    }

    public synchronized void remove(K key) {
        // TODO
    }

    public synchronized int size() {
        return map.size();
    }

    public synchronized void clear() {
        map.clear();
    }
}
