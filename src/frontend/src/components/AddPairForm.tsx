import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useCallback, useState } from "react";

interface AddPairFormProps {
  onAdd: (symbol: string) => void;
  isAdding: boolean;
  search: string;
  onSearchChange: (value: string) => void;
}

export function AddPairForm({
  onAdd,
  isAdding,
  search,
  onSearchChange,
}: AddPairFormProps) {
  const [newSymbol, setNewSymbol] = useState("");

  const handleAdd = useCallback(() => {
    const s = newSymbol.trim().toUpperCase();
    if (!s) return;
    onAdd(s);
    setNewSymbol("");
  }, [newSymbol, onAdd]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 py-4 border-t border-border bg-secondary/30">
      <div className="flex items-center gap-2 flex-1">
        <Input
          placeholder="EUR/USD"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          className="w-full sm:w-48 bg-background border-input"
          data-ocid="forex.input"
        />
        <Button
          onClick={handleAdd}
          disabled={!newSymbol.trim() || isAdding}
          data-ocid="forex.add_button"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Pair
        </Button>
      </div>
      <div className="flex items-center gap-2 flex-1 sm:justify-end">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search pairs..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-56 bg-background border-input"
          data-ocid="forex.search_input"
        />
      </div>
    </div>
  );
}
