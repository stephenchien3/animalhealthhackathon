/**
 * Address autocomplete using Mapbox Geocoding API.
 * Shows dropdown suggestions as the user types and returns
 * the selected address, latitude, and longitude.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

interface Suggestion {
  id: string;
  placeName: string;
  latitude: number;
  longitude: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Start typing an address...",
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync external value changes (e.g. when editing a shed)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text || text.length < 3 || !MAPBOX_TOKEN) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const encoded = encodeURIComponent(text);
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&types=address,place,locality,neighborhood,poi`
      );
      const data = await res.json();

      const results: Suggestion[] = (data.features ?? []).map(
        (f: { id: string; place_name: string; center: [number, number] }) => ({
          id: f.id,
          placeName: f.place_name,
          longitude: f.center[0],
          latitude: f.center[1],
        })
      );

      setSuggestions(results);
      setIsOpen(results.length > 0);
      setHighlightIndex(-1);
    } catch {
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleInputChange(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  }

  function handleSelect(suggestion: Suggestion) {
    setQuery(suggestion.placeName);
    setSuggestions([]);
    setIsOpen(false);
    onChange(suggestion.placeName, suggestion.latitude, suggestion.longitude);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]!);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                i === highlightIndex ? "bg-accent" : ""
              }`}
              onMouseEnter={() => setHighlightIndex(i)}
              onClick={() => handleSelect(s)}
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <span>{s.placeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
