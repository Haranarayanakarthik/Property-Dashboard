import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  Building2,
  Calendar,
  Layers,
  MapPin,
  User,
  Eye,
  Filter
} from 'lucide-react';
import { propertiesData } from '../utils/dataProcessor';

export default function PropertyTable({ selectedCity }) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [wardFilter, setWardFilter] = useState('All');
  
  // Sort State
  const [sortField, setSortField] = useState('property_id');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Expanded Row State
  const [expandedPropertyId, setExpandedPropertyId] = useState(null);

  // Apply filters and sorting
  const filteredAndSortedData = useMemo(() => {
    let result = [...propertiesData];

    // 1. Tenant Filter from Dashboard
    if (selectedCity !== 'All') {
      result = result.filter(p => p.tenant.toLowerCase() === selectedCity.toLowerCase());
    }

    // 2. Local Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // 3. Local Property Type Filter
    if (typeFilter !== 'All') {
      result = result.filter(p => p.property_type.toLowerCase() === typeFilter.toLowerCase());
    }

    // 4. Local Ward Filter
    if (wardFilter !== 'All') {
      result = result.filter(p => p.ward.toLowerCase() === wardFilter.toLowerCase());
    }

    // 5. Global Text Search
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        (p.property_id || '').toLowerCase().includes(term) ||
        (p.owner_name || '').toLowerCase().includes(term) ||
        (p.address || '').toLowerCase().includes(term) ||
        (p.ward || '').toLowerCase().includes(term)
      );
    }

    // 6. Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle undefined/null values
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      // Type-specific comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      } else {
        return sortOrder === 'asc' 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA));
      }
    });

    return result;
  }, [selectedCity, searchTerm, statusFilter, typeFilter, wardFilter, sortField, sortOrder]);

  // Wards available for the filter list (based on current selection)
  const uniqueWards = useMemo(() => {
    const subset = selectedCity === 'All' 
      ? propertiesData 
      : propertiesData.filter(p => p.tenant.toLowerCase() === selectedCity.toLowerCase());
    const wards = new Set(subset.map(p => p.ward).filter(Boolean));
    return Array.from(wards).sort();
  }, [selectedCity]);

  // Unique property types
  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(propertiesData.map(p => p.property_type).filter(Boolean))).sort();
  }, []);

  // Pagination bounds
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    // Clamp current page in range
    const page = Math.min(currentPage, totalPages);
    const start = (page - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize, totalPages]);

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset page on filter changes
  const handleFilterChange = (filterSetter, value) => {
    filterSetter(value);
    setCurrentPage(1);
  };

  // Request sort
  const requestSort = (field) => {
    let order = 'asc';
    if (sortField === field && sortOrder === 'asc') {
      order = 'desc';
    }
    setSortField(field);
    setSortOrder(order);
  };

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').trim().toLowerCase();
    if (s === 'approved') {
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">Approved</span>;
    } else if (s === 'rejected') {
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">Rejected</span>;
    } else {
      return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">Pending</span>;
    }
  };

  const toggleRow = (id) => {
    setExpandedPropertyId(expandedPropertyId === id ? null : id);
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl shadow-2xl space-y-6">
      
      {/* Table Title and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Property Registry</h3>
            <p className="text-xs text-slate-400 mt-1">
              Explore property tax entries ({totalItems} records found)
            </p>
          </div>
        </div>

        {/* Filters Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              placeholder="Search Owner, ID, Address..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Property Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => handleFilterChange(setTypeFilter, e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="All">All Property Types</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Ward Filter */}
          <div className="relative">
            <select
              value={wardFilter}
              onChange={(e) => handleFilterChange(setWardFilter, e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="All">All Wards</option>
              {uniqueWards.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Grid Canvas */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/40 border-b border-white/5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-4 px-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort('property_id')}>
                <div className="flex items-center gap-1.5">
                  Property ID
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              {selectedCity === 'All' && (
                <th className="py-4 px-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort('tenant')}>
                  <div className="flex items-center gap-1.5">
                    City
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              )}
              <th className="py-4 px-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort('owner_name')}>
                <div className="flex items-center gap-1.5">
                  Owner
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-4 px-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort('property_type')}>
                <div className="flex items-center gap-1.5">
                  Type
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-4 px-4 cursor-pointer hover:bg-white/5 transition-colors text-right" onClick={() => requestSort('area_sqft')}>
                <div className="flex items-center gap-1.5 justify-end">
                  Area (sqft)
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-4 px-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => requestSort('status')}>
                <div className="flex items-center gap-1.5">
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-4 px-4 cursor-pointer hover:bg-white/5 transition-colors text-right" onClick={() => requestSort('collection_inr')}>
                <div className="flex items-center gap-1.5 justify-end">
                  Collected Tax
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-4 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-300">
            {paginatedData.length > 0 ? (
              paginatedData.map((prop) => {
                const isExpanded = expandedPropertyId === prop.property_id;
                return (
                  <React.Fragment key={prop.property_id}>
                    {/* Main Row */}
                    <tr 
                      className={`hover:bg-white/5 transition-colors group cursor-pointer ${
                        isExpanded ? 'bg-indigo-500/5' : ''
                      }`}
                      onClick={() => toggleRow(prop.property_id)}
                    >
                      <td className="py-4 px-4 font-mono text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                        {prop.property_id}
                      </td>
                      {selectedCity === 'All' && (
                        <td className="py-4 px-4 font-medium text-white">{prop.tenant}</td>
                      )}
                      <td className="py-4 px-4 font-medium text-white">{prop.owner_name}</td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-400">{prop.property_type}</td>
                      <td className="py-4 px-4 text-right font-medium">{prop.area_sqft.toLocaleString()}</td>
                      <td className="py-4 px-4">{getStatusBadge(prop.status)}</td>
                      <td className="py-4 px-4 text-right font-bold text-slate-200">
                        {formatCurrency(prop.collection_inr)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(prop.property_id);
                          }}
                          className={`p-1.5 rounded-lg border border-white/5 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-400 bg-slate-950/40 transition-all ${
                            isExpanded ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : ''
                          }`}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <tr className="bg-indigo-950/10 border-l-2 border-indigo-500">
                        <td colSpan={selectedCity === 'All' ? 8 : 7} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                            
                            {/* Address details */}
                            <div className="space-y-1.5 md:col-span-2">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                                Address Details
                              </div>
                              <p className="text-white font-medium pl-5 leading-relaxed">{prop.address}</p>
                              <p className="text-xs text-slate-400 pl-5">Ward: <span className="font-semibold text-slate-300">{prop.ward}</span> | City: <span className="font-semibold text-slate-300">{prop.tenant}</span></p>
                            </div>

                            {/* Construction details */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                                Building Info
                              </div>
                              <div className="pl-5 space-y-1 text-xs">
                                <p className="text-slate-400">Floors: <span className="font-semibold text-white">{prop.floor_count} storeys</span></p>
                                <p className="text-slate-400">Area: <span className="font-semibold text-white">{prop.area_sqft} sq. ft.</span></p>
                                <p className="text-slate-400">Category: <span className="font-semibold text-white">{prop.property_type}</span></p>
                              </div>
                            </div>

                            {/* Financial details */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                                Registration & Tax
                              </div>
                              <div className="pl-5 space-y-1 text-xs">
                                <p className="text-slate-400">Date: <span className="font-semibold text-white">{new Date(prop.registration_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span></p>
                                <p className="text-slate-400">Annual Tax: <span className="font-semibold text-rose-400">{formatCurrency(prop.annual_tax_inr)}</span></p>
                                <p className="text-slate-400">Collected: <span className="font-semibold text-emerald-400">{formatCurrency(prop.collection_inr)}</span></p>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={selectedCity === 'All' ? 8 : 7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Filter className="h-8 w-8 text-slate-600" />
                    <p className="font-medium text-slate-400">No properties match your filter parameters</p>
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('All');
                        setTypeFilter('All');
                        setWardFilter('All');
                      }}
                      className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400 border-t border-white/5 pt-4">
        
        {/* Page size picker */}
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-950/60 border border-white/5 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
          >
            {[10, 25, 50, 100].map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500">
            Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </span>
        </div>

        {/* Page buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 hover:text-white disabled:opacity-30 disabled:hover:border-white/5 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 hover:text-white disabled:opacity-30 disabled:hover:border-white/5 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="px-4 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold text-xs">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 hover:text-white disabled:opacity-30 disabled:hover:border-white/5 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 hover:text-white disabled:opacity-30 disabled:hover:border-white/5 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
