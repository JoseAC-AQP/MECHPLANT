import React, { useState } from 'react';
import { Box, Cog, Factory, GripVertical, Search } from 'lucide-react';
import { COMPONENT_LIBRARY } from '../data/components';
import { ComponentCategory, ComponentDefinition } from '../types/engineering';

interface ComponentLibraryProps {
  selectedComponentId: string;
  onSelectComponent: (component: ComponentDefinition) => void;
}

const CATEGORIES: { id: ComponentCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'STRUCTURAL', label: 'Elementos estructurales', icon: <Box className="w-3.5 h-3.5" /> },
  { id: 'MACHINE', label: 'Elementos de máquinas', icon: <Cog className="w-3.5 h-3.5" /> },
  { id: 'INDUSTRIAL', label: 'Equipos industriales', icon: <Factory className="w-3.5 h-3.5" /> },
];

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  selectedComponentId,
  onSelectComponent,
}) => {
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="px-3.5 py-3 border-b border-slate-200">
        <h2 className="text-xs font-semibold text-slate-900 tracking-tight">
          Biblioteca de Componentes
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Selecciona o arrastra al visor 3D
        </p>
        <div className="relative mt-2.5">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar componente..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto cae-scroll p-2.5 space-y-4">
        {CATEGORIES.map((cat) => {
          const items = COMPONENT_LIBRARY.filter(
            (c) =>
              c.category === cat.id &&
              (normalized === '' ||
                c.name.toLowerCase().includes(normalized) ||
                c.industrialContext.toLowerCase().includes(normalized)),
          );
          if (items.length === 0) return null;

          return (
            <div key={cat.id}>
              <div className="flex items-center gap-1.5 px-1.5 mb-1.5 text-[11px] font-semibold text-slate-600">
                {cat.icon}
                <span>{cat.label}</span>
              </div>
              <div className="space-y-1">
                {items.map((comp) => {
                  const active = comp.id === selectedComponentId;
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/component-id', comp.id);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => onSelectComponent(comp)}
                      className={`w-full text-left px-2.5 py-2 rounded border transition-colors flex items-start gap-2 cursor-pointer ${
                        active
                          ? 'bg-blue-50 border-blue-500 text-blue-950'
                          : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">{comp.name}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {comp.industrialContext}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
