
import React from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

interface PGFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PGFilters: React.FC<PGFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search PGs by name or location..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All PGs</TabsTrigger>
          <TabsTrigger value="male">Male PGs</TabsTrigger>
          <TabsTrigger value="female">Female PGs</TabsTrigger>
          <TabsTrigger value="unisex">Unisex PGs</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default PGFilters;
