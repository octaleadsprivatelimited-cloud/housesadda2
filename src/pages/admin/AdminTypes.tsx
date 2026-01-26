import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit2, Trash2, Building2, Loader2, Check, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { typesAPI, propertiesAPI } from '@/lib/api';

const AdminTypes = () => {
  const { toast } = useToast();
  const [types, setTypes] = useState<any[]>([]);
  const [propertyCount, setPropertyCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newType, setNewType] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setIsLoading(true);
      const data = await typesAPI.getAll();
      setTypes(data);
      
      const counts: Record<string, number> = {};
      for (const type of data) {
        try {
          const props = await propertiesAPI.getAll({ active: true, type: type.name });
          counts[type.name] = props.length;
        } catch {
          counts[type.name] = 0;
        }
      }
      setPropertyCount(counts);
    } catch (error) {
      console.error('Error loading types:', error);
      toast({ title: "Error", description: "Failed to load", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const addType = async () => {
    if (!newType.trim()) {
      toast({ title: "Error", description: "Enter type name", variant: "destructive" });
      return;
    }
    try {
      await typesAPI.create(newType.trim());
      toast({ title: "Added" });
      setNewType('');
      await loadTypes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteType = async (id: number) => {
    if (!confirm('Delete this type?')) return;
    try {
      await typesAPI.delete(id);
      toast({ title: "Deleted", variant: "destructive" });
      await loadTypes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const startEdit = (type: any) => {
    setEditingId(type.id);
    setEditName(type.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await typesAPI.update(editingId, editName.trim());
      toast({ title: "Updated" });
      setEditingId(null);
      await loadTypes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Property Types</h1>
          <p className="text-gray-500 text-sm">{types.length} categories</p>
        </div>
      </div>

      {/* Add + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="New type name"
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none w-40"
            onKeyPress={(e) => e.key === 'Enter' && addType()}
          />
          <Button onClick={addType} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Types Table */}
      {filteredTypes.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type Name</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Properties</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((type, idx) => (
                <tr 
                  key={type.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    {editingId === type.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-3 py-1.5 rounded border border-blue-300 text-sm outline-none focus:border-blue-500 w-48"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-800">{type.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      propertyCount[type.name] > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {propertyCount[type.name] || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => startEdit(type)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteType(type.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">No property types found</p>
          <p className="text-sm text-gray-400">Add your first type above</p>
        </div>
      )}
    </div>
  );
};

export default AdminTypes;
