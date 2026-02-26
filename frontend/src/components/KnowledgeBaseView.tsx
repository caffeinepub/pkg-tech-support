import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, Eye, Tag, Plus, Edit } from 'lucide-react';
import { KBArticle, KnowledgeCategory } from '../backend';
import { useGetAllKBArticles, useSearchKBArticles } from '../hooks/useKnowledgeBase';
import KBArticleDetail from './KBArticleDetail';
import KBArticleEditor from './KBArticleEditor';

interface KnowledgeBaseViewProps {
  isAdmin?: boolean;
}

const categoryLabels: Record<string, string> = {
  PrintersPeripherals: 'Printers & Peripherals',
  NetworkConnectivity: 'Network & Connectivity',
  AccountPasswords: 'Account & Passwords',
  HardwareSupport: 'Hardware Support',
  SoftwareSupport: 'Software Support',
  GeneralSupport: 'General Support',
  WindowsSupport: 'Windows Support',
};

const categoryColors: Record<string, string> = {
  PrintersPeripherals: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  NetworkConnectivity: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  AccountPasswords: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  HardwareSupport: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  SoftwareSupport: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  GeneralSupport: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  WindowsSupport: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
};

// KnowledgeCategory is a TypeScript enum — use String() to get the key
function getCategoryKey(category: KnowledgeCategory): string {
  return String(category);
}

export default function KnowledgeBaseView({ isAdmin }: KnowledgeBaseViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KBArticle | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: allArticles, isLoading } = useGetAllKBArticles();
  const { data: searchResults, isLoading: isSearching } = useSearchKBArticles(debouncedSearch);

  const articles = debouncedSearch.trim() ? (searchResults || []) : (allArticles || []);
  const filtered =
    categoryFilter === 'all'
      ? articles
      : articles.filter((a) => getCategoryKey(a.category) === categoryFilter);

  if (selectedArticle) {
    return (
      <KBArticleDetail
        article={selectedArticle}
        isAdmin={isAdmin}
        onBack={() => setSelectedArticle(null)}
        onEdit={(a) => {
          setEditingArticle(a);
          setShowEditor(true);
          setSelectedArticle(null);
        }}
      />
    );
  }

  if (showEditor) {
    return (
      <KBArticleEditor
        article={editingArticle}
        onSuccess={() => {
          setShowEditor(false);
          setEditingArticle(null);
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingArticle(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Knowledge Base
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Find answers to common IT support questions
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditingArticle(null);
              setShowEditor(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> New Article
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading || isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No articles found</p>
          <p className="text-sm">
            {debouncedSearch
              ? `No results for "${debouncedSearch}"`
              : 'No articles in this category yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((article) => {
            const catKey = getCategoryKey(article.category);
            return (
              <Card
                key={article.id.toString()}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group"
                onClick={() => setSelectedArticle(article)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        categoryColors[catKey] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {categoryLabels[catKey] || catKey}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {article.viewCount.toString()}
                    </div>
                  </div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.body.slice(0, 150)}
                    {article.body.length > 150 ? '...' : ''}
                  </p>
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-0.5 text-xs bg-muted px-2 py-0.5 rounded-full"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{article.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingArticle(article);
                        setShowEditor(true);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
