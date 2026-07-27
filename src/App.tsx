import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Info, Loader2, Book, FileText, Component, 
  BrainCircuit, Library, Type, LayoutTemplate, ChevronRight, 
  ChevronLeft, Lightbulb, Cloud, Palette, GitCompare, 
  Compass, Zap, Microscope, Menu, X, Heart, Rocket
} from 'lucide-react';
import { fetchSurahs, fetchSurah, SurahSummary, Ayah } from './lib/quran';
import { explainAyah, TafsirData, analyzeSurahStructure, SurahStructureData } from './lib/gemini';
import { MermaidDiagram } from './components/MermaidDiagram';
import { motion, AnimatePresence } from 'motion/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectList,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Dimension = 'reader' | 'atlas' | 'application' | 'lab';

export default function App() {
  const [activeDimension, setActiveDimension] = useState<Dimension>('reader');
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [selectedAyah, setSelectedAyah] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ayahSearchQuery, setAyahSearchQuery] = useState('');
  
  const [loadingSurahs, setLoadingSurahs] = useState(true);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [tafsirData, setTafsirData] = useState<TafsirData | null>(null);
  const [structureData, setStructureData] = useState<SurahStructureData | null>(null);
  const [error, setError] = useState('');

  const navigateToAyah = (direction: 'next' | 'prev') => {
    if (!selectedAyah || !ayahs.length) return;
    const currentIndex = ayahs.findIndex(a => a.numberInSurah === parseInt(selectedAyah));
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < ayahs.length) {
      handleAyahChange(ayahs[nextIndex].numberInSurah.toString());
    }
  };

  useEffect(() => {
    fetchSurahs()
      .then(setSurahs)
      .catch(console.error)
      .finally(() => setLoadingSurahs(false));
  }, []);

  const handleSurahChange = async (value: string) => {
    setSelectedSurah(value);
    setSelectedAyah('');
    setAyahSearchQuery('');
    setTafsirData(null);
    setStructureData(null);
    setLoadingAyahs(true);
    try {
      const data = await fetchSurah(parseInt(value));
      setAyahs(data.ayahs);
      
      if (activeDimension === 'atlas') {
        fetchStructure(value);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAyahs(false);
    }
  };

  const fetchStructure = async (surahId: string) => {
    const surah = surahs.find(s => s.number === parseInt(surahId));
    if (!surah) return;
    setLoadingData(true);
    setError('');
    try {
      const data = await analyzeSurahStructure(surah.name, surah.numberOfAyahs);
      setStructureData(data);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل الهيكلية');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAyahDetails = async (ayahId: string) => {
    const surah = surahs.find(s => s.number === parseInt(selectedSurah));
    const ayah = ayahs.find(a => a.numberInSurah === parseInt(ayahId));
    if (!surah || !ayah) return;
    setLoadingData(true);
    setError('');
    try {
      const data = await explainAyah(surah.name, ayah.numberInSurah, ayah.text);
      setTafsirData(data);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل تفاصيل الآية');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAyahChange = (value: string) => {
    setSelectedAyah(value);
    fetchAyahDetails(value);
    if (activeDimension === 'atlas') {
      setActiveDimension('reader');
    }
  };

  useEffect(() => {
    if (activeDimension === 'atlas' && selectedSurah && !structureData && !loadingData) {
      fetchStructure(selectedSurah);
    }
  }, [activeDimension, selectedSurah]);

  const currentSurah = surahs.find((s) => s.number === parseInt(selectedSurah));
  const currentAyah = ayahs.find((a) => a.numberInSurah === parseInt(selectedAyah));

  const dimensions = [
    { id: 'reader', name: 'تفسير الآية', icon: BookOpen },
    { id: 'atlas', name: 'هيكل السورة', icon: Compass },
    { id: 'application', name: 'هدايات قرآنية', icon: Zap },
    { id: 'lab', name: 'لطائف بيانية', icon: Microscope },
  ];

  const handleRandomAyah = async () => {
    setLoadingData(true);
    try {
      const randomSurahNum = Math.floor(Math.random() * 114) + 1;
      const sData = await fetchSurah(randomSurahNum);
      const randomAyahIdx = Math.floor(Math.random() * sData.ayahs.length);
      const rAyah = sData.ayahs[randomAyahIdx];
      
      setSelectedSurah(randomSurahNum.toString());
      setAyahs(sData.ayahs);
      setSelectedAyah(rAyah.numberInSurah.toString());
      
      const tData = await explainAyah(sData.name, rAyah.numberInSurah, rAyah.text);
      setTafsirData(tData);
      setActiveDimension('reader');
    } catch (e) {
      setError('حدث خطأ أثناء جلب آية عشوائية');
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#222] font-sans selection:bg-brand-secondary/20 overflow-x-hidden pb-20" dir="rtl">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-[#8B2635]/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-[5%] w-[30%] h-[30%] bg-[#C18F59]/5 rounded-full blur-[100px]" />
      </div>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 px-4 md:px-8 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-[#8B2635] to-[#C18F59] flex items-center justify-center text-white shadow-xl shadow-[#8B2635]/20 shrink-0 transition-transform group-hover:rotate-6">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-[#8B2635] hidden sm:block leading-none">بيان وهدى</h1>
              <span className="text-[10px] font-bold text-[#C18F59] opacity-70 hidden sm:block leading-tight">رحلة في أعماق التنـزيل</span>
            </div>
          </div>

          <div className="flex items-center bg-black/5 p-1.5 rounded-[1.5rem] overflow-x-auto no-scrollbar max-w-full shadow-inner">
            {dimensions.map((dim) => (
              <button
                key={dim.id}
                onClick={() => setActiveDimension(dim.id as Dimension)}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-[1.1rem] transition-all duration-500 relative overflow-hidden font-bold",
                  activeDimension === dim.id 
                    ? "bg-white shadow-lg text-[#8B2635] scale-105 z-10" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/40"
                )}
              >
                <dim.icon className={cn("w-4 h-4 md:w-5 md:h-5 transition-colors", activeDimension === dim.id ? "text-[#8B2635]" : "text-gray-400")} />
                <span className="text-sm whitespace-nowrap">{dim.name}</span>
                {activeDimension === dim.id && (
                  <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 opacity-50" />
                )}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
             <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase">Live تدبر</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10 space-y-12">
        {/* New Integrated Control Bar */}
        <section className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[3.5rem] border-2 border-[#8B2635]/5 shadow-[0_20px_50px_rgba(139,38,53,0.1)] sticky top-24 z-40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-2">
                <label className="text-[11px] font-black text-[#8B2635] uppercase tracking-[0.2em] flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[#C18F59]" />
                  اختيار السورة
                </label>
              </div>
              <Select value={selectedSurah} onValueChange={handleSurahChange} disabled={loadingSurahs}>
                <SelectTrigger className="w-full bg-[#FDFBF7] border-2 border-black/5 rounded-[1.5rem] h-14 shadow-none transition-all focus:ring-4 focus:ring-[#8B2635]/10 text-right font-bold text-lg" dir="rtl">
                  <SelectValue placeholder={loadingSurahs ? "لحظة من فضلك..." : "ابحث عن سورة..."} />
                </SelectTrigger>
                <SelectContent className="rounded-[2rem] border-black/5 bg-white shadow-3xl z-[100] w-[300px] md:w-[350px]" dir="rtl">
                  <div 
                    className="p-3 pb-2 border-b border-black/5 mb-2 sticky top-0 bg-white z-10"
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Input 
                      placeholder="اسم السورة أو رقمها..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 border-none shadow-none focus-visible:ring-0 px-3 bg-black/5 rounded-xl text-right font-bold"
                    />
                  </div>
                  <ScrollArea className="h-80 md:h-[500px]">
                    <SelectList>
                      {surahs.filter(s => s.name.includes(searchQuery) || s.number.toString().includes(searchQuery)).map((s) => (
                        <SelectItem key={s.number} value={s.number.toString()} className="focus:bg-[#8B2635]/5 focus:text-[#8B2635] rounded-2xl cursor-pointer p-3 mx-1 mb-1 border-b border-black/[0.01]">
                          <div className="flex items-center justify-between w-full gap-8">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[10px] font-black text-gray-500">{s.number}</span>
                              <span className="font-black text-lg">{s.name}</span>
                            </div>
                            <span className={cn(
                              "text-[10px] font-black px-2 py-1 rounded-lg border-2",
                              s.revelationType === 'Meccan' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                            )}>
                              {s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectList>
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-4 space-y-3">
              <label className="text-[11px] font-black text-[#8B2635] uppercase tracking-[0.2em] mr-2">تحديد الآية</label>
              <Select value={selectedAyah} onValueChange={handleAyahChange} disabled={!selectedSurah || loadingAyahs}>
                <SelectTrigger className="w-full bg-[#FDFBF7] border-2 border-black/5 rounded-[1.5rem] h-14 shadow-none transition-all focus:ring-4 focus:ring-[#8B2635]/10 text-right font-bold text-lg" dir="rtl">
                  <SelectValue placeholder={loadingAyahs ? "جاري التحميل..." : (ayahs.length ? "اختر الآية..." : "اختر السورة أولاً")} />
                </SelectTrigger>
                <SelectContent className="rounded-[2rem] border-black/5 bg-white shadow-3xl z-[100] w-[350px] md:w-[450px]" dir="rtl">
                  <div 
                    className="p-3 pb-2 border-b border-black/5 mb-2 sticky top-0 bg-white z-10"
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Input 
                      placeholder="رقم الآية أو كلمة من نصها..." 
                      value={ayahSearchQuery}
                      onChange={(e) => setAyahSearchQuery(e.target.value)}
                      className="h-12 border-none shadow-none focus-visible:ring-0 px-3 bg-black/5 rounded-xl text-right font-bold"
                    />
                  </div>
                  <ScrollArea className="h-[500px]">
                    <SelectList>
                      {ayahs
                        .filter(a => a.text.includes(ayahSearchQuery) || a.numberInSurah.toString().includes(ayahSearchQuery))
                        .map((a) => (
                          <SelectItem key={a.numberInSurah} value={a.numberInSurah.toString()} className="text-right focus:bg-[#8B2635]/5 focus:text-[#8B2635] rounded-2xl cursor-pointer p-5 mx-1 border-b border-black/[0.02] last:border-0 grow">
                            <div className="flex flex-col items-end gap-3 w-full">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-black text-brand-primary">
                                  {a.numberInSurah}
                                </div>
                                <div className="font-black text-xs text-[#8B2635] uppercase tracking-widest">آية</div>
                              </div>
                              <div className="text-xl text-gray-800 font-serif leading-[1.8] text-right dir-rtl w-full opacity-95 group-focus:opacity-100">
                                {a.text}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectList>
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-14 rounded-[1.5rem] border-2 border-[#8B2635]/10 bg-white hover:bg-[#8B2635] hover:text-white transition-all duration-300 text-[#8B2635] font-black gap-3 shadow-lg hover:shadow-[#8B2635]/20 group"
                onClick={handleRandomAyah}
                disabled={loadingData}
              >
                <div className="w-8 h-8 rounded-full bg-[#8B2635]/5 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Zap className={cn("w-4 h-4", loadingData ? "animate-pulse" : "")} />
                </div>
                آية عشوائية
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-3xl text-sm border border-red-100 animate-pulse text-center">
            {error}
          </div>
        )}

        <div className="w-full">
          <AnimatePresence mode="wait">
            {loadingData ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[40vh] flex flex-col items-center justify-center space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-[#8B2635]/10 rounded-full" />
                  <div className="w-20 h-20 border-4 border-t-[#8B2635] rounded-full animate-spin absolute top-0" />
                </div>
                <p className="text-xl font-medium animate-pulse text-[#8B2635]">جاري التحميل...</p>
              </motion.div>
            ) : activeDimension === 'reader' ? (
              <DimensionReader key="reader" currentSurah={currentSurah} currentAyah={currentAyah} tafsirData={tafsirData} onNavigate={navigateToAyah} />
            ) : activeDimension === 'atlas' ? (
              <DimensionAtlas key="atlas" currentSurah={currentSurah} structureData={structureData} />
            ) : activeDimension === 'application' ? (
              <DimensionApplication key="application" currentAyah={currentAyah} tafsirData={tafsirData} onNavigate={navigateToAyah} />
            ) : (
              <DimensionLab key="lab" currentAyah={currentAyah} tafsirData={tafsirData} onNavigate={navigateToAyah} />
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <footer className="mt-20 py-16 border-t border-black/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center space-y-8">
           <div className="flex gap-12 text-sm font-bold text-gray-400">
             <span>بيان تحليلي</span>
             <span>ظلال إيمانية</span>
             <span>أسرار لغوية</span>
           </div>
           <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
             منصة "بيان وهدى" تهدف إلى تيسير التدبر القرآني عبر الربط بين الهيكلية الموضوعية، والظلال الوجدانية، والتطبيق الواقعي في العصر الحديث.
           </p>
        </div>
      </footer>
    </div>
  );
}

function DimensionReader({ currentSurah, currentAyah, tafsirData, onNavigate }: { currentSurah?: SurahSummary, currentAyah?: Ayah, tafsirData: TafsirData | null, onNavigate?: (dir: 'next' | 'prev') => void }) {
  if (!currentAyah) return <EmptyState icon={Book} title="تفسير الآية" description="اختر سورة وآية من شريط التحكم في الأعلى لبدء استكشاف معانيها." />;
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 pb-20">
      <div className="text-center space-y-10 relative group">
        <div className="inline-flex items-center gap-4 bg-white/70 backdrop-blur-md px-8 py-3 rounded-full border-2 border-brand-primary/5 text-sm font-black text-[#8B2635] shadow-xl">
          <span>سورة {currentSurah?.name}</span>
          <span className="w-1.5 h-1.5 bg-[#C18F59] rounded-full" />
          <span>الآية {currentAyah.numberInSurah}</span>
        </div>

        <div className="bg-white/40 group-hover:bg-white/60 transition-colors p-8 md:p-12 lg:p-16 rounded-[4rem] border-2 border-brand-primary/5 relative flex items-center gap-4 shadow-inner min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.02] to-transparent pointer-none -z-10" />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onNavigate?.('prev')}
            className="rounded-full w-14 h-14 bg-white shadow-lg text-[#C18F59] hover:bg-brand-primary hover:text-white transition-all shrink-0"
            title="الآية السابقة"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          <h2 className="font-serif leading-[2.5] text-justify text-4xl md:text-6xl lg:text-7xl text-[#8B2635] px-4 text-center flex-1 drop-shadow-sm font-normal" dir="rtl">
            {currentAyah.text}
          </h2>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onNavigate?.('next')}
            className="rounded-full w-14 h-14 bg-white shadow-lg text-[#C18F59] hover:bg-brand-primary hover:text-white transition-all shrink-0"
            title="الآية التالية"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="bg-white/70 backdrop-blur-md border-none rounded-[2rem] shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#C18F59]" />
                المعنى الإجمالي والتحليلي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="p-6 bg-[#8B2635]/5 rounded-3xl border border-[#8B2635]/10">
                <p className="font-serif text-xl text-gray-800 italic leading-relaxed">{tafsirData?.simplifiedTafsir}</p>
              </div>
              <div className="pt-4">
                <p className="font-serif text-lg text-gray-600 leading-relaxed whitespace-pre-wrap text-justify">{tafsirData?.detailedTafsir}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-8">
          <Card className="bg-white/70 backdrop-blur-md border-none rounded-[2rem] shadow-xl">
             <CardHeader className="pb-2">
               <CardTitle className="text-xl font-bold flex items-center gap-2">
                 <Cloud className="w-5 h-5 text-[#C18F59]" />
                 في ظلال الآية
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="font-serif text-gray-600 italic leading-relaxed text-justify">
                 {tafsirData?.shadeOfAyah}
               </p>
             </CardContent>
          </Card>
          
          <Card className="bg-blue-50/30 border-none rounded-[2rem] shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-xl font-bold flex items-center gap-2">
                 <LayoutTemplate className="w-5 h-5 text-blue-500" />
                 سياق النظم
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-sm font-medium text-blue-800/70 leading-relaxed">
                 {tafsirData?.contextAndConnection}
               </p>
             </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function DimensionAtlas({ currentSurah, structureData }: { currentSurah?: SurahSummary, structureData: SurahStructureData | null }) {
  if (!structureData) return <EmptyState icon={Compass} title="هيكل السورة" description="اختر سورة من شريط التحكم لبناء خريطتها الذهنية واستكشاف مقاصدها وموضوعاتها." />;
  
  const colors = [
    'border-emerald-200 bg-emerald-50 text-emerald-900',
    'border-amber-200 bg-amber-50 text-amber-900',
    'border-sky-200 bg-sky-50 text-sky-900',
    'border-rose-200 bg-rose-50 text-rose-900',
    'border-indigo-200 bg-indigo-50 text-indigo-900',
    'border-purple-200 bg-purple-50 text-purple-900',
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 pb-20">
      {/* Title Header Section */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-0 bg-brand-primary/5 blur-3xl -z-10 rounded-full" />
        <div className="bg-white border-4 border-[#8B2635] rounded-[2.5rem] p-8 shadow-xl text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <BookOpen className="w-12 h-12" />
           </div>
           
           <div className="flex items-center justify-center gap-8 mb-6">
             <div className="flex flex-col items-center">
               <span className="text-[10px] font-black text-[#C18F59] uppercase tracking-tighter">ترتيبها</span>
               <div className="w-12 h-12 rounded-xl bg-[#C18F59]/10 border-2 border-[#C18F59]/20 flex items-center justify-center font-bold text-[#C18F59]">
                 {currentSurah?.number}
               </div>
             </div>
             
             <div className="text-center">
               <h2 className="text-4xl font-black text-[#8B2635] font-serif mb-2">{structureData.surahName}</h2>
               <div className="h-1 w-20 bg-[#8B2635] mx-auto rounded-full mb-4 opacity-20" />
               <p className="text-xl font-bold text-gray-700">{structureData.centralIdea}</p>
             </div>

             <div className="flex flex-col items-center">
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">آياتها</span>
               <div className="w-12 h-12 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center font-bold text-emerald-600">
                 {currentSurah?.numberOfAyahs}
               </div>
             </div>
           </div>
        </div>
        
        {/* Connection Line Down */}
        <div className="w-1 h-12 bg-gray-200 mx-auto" />
        <div className="w-full h-1 bg-gray-200 rounded-full" />
      </div>

      {/* Topics Grid/Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        {structureData.sections.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "relative border-b-8 rounded-[2rem] p-6 shadow-lg flex flex-col transition-transform hover:scale-[1.02]",
              colors[idx % colors.length]
            )}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-gray-200" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="px-3 py-1 rounded-full bg-white/60 text-[10px] font-black tracking-tighter border border-black/5 uppercase">
                الآيات {section.startAyah} - {section.endAyah}
              </div>
              <Compass className="w-4 h-4 opacity-40 shrink-0" />
            </div>
            
            <h3 className="text-lg font-black mb-3 leading-tight">{section.title}</h3>
            <p className="text-sm opacity-80 leading-relaxed font-medium">
              {section.summary}
            </p>
          </motion.div>
        ))}
      </div>
      
      {/* Visual Connection Diagram */}
      <div className="bg-white/70 backdrop-blur-md p-8 md:p-12 rounded-[3rem] border border-white/20 shadow-xl overflow-hidden mt-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-[#C18F59] rounded-full" />
          <h3 className="text-2xl font-bold">الخريطة المفاهيمية للسورة</h3>
        </div>
        <div className="flex justify-center w-full min-h-[400px]">
          <MermaidDiagram chart={structureData.mermaidDiagram} />
        </div>
      </div>
    </motion.div>
  );
}

function DimensionApplication({ currentAyah, tafsirData, onNavigate }: { currentAyah?: Ayah, tafsirData: TafsirData | null, onNavigate?: (dir: 'next' | 'prev') => void }) {
  if (!tafsirData) return <EmptyState icon={Zap} title="هدايات قرآنية" description="اختر سورة وآية من شريط التحكم لاستكشاف كيفية تطبيقها في واقعك المعاصر." />;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 pb-20">
      <div className="flex items-center justify-between gap-4 py-4 px-2 bg-black/5 rounded-3xl">
        <Button variant="ghost" onClick={() => onNavigate?.('prev')} className="text-[#C18F59] font-bold"><ChevronRight className="ml-1" /> الآية السابقة</Button>
        <div className="text-sm font-bold text-gray-500">الآية {currentAyah?.numberInSurah}</div>
        <Button variant="ghost" onClick={() => onNavigate?.('next')} className="text-[#C18F59] font-bold">الآية التالية <ChevronLeft className="mr-1" /></Button>
      </div>

      <section className="bg-emerald-50/30 p-8 md:p-12 rounded-[3rem] border border-emerald-100 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 p-8 opacity-10">
          <Zap className="w-40 h-40 text-emerald-500" />
        </div>
        <div className="relative z-10 space-y-8">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
               <Lightbulb className="w-6 h-6" />
             </div>
             <h3 className="text-3xl font-bold text-emerald-800">رسالة الآية لواقعك المعاصر</h3>
           </div>
           <p className="font-serif text-2xl text-emerald-950/80 leading-relaxed font-medium text-justify">
             {tafsirData.modernApplication}
           </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-indigo-50/40 p-8 rounded-[3.5rem] border-2 border-indigo-100 shadow-xl shadow-indigo-500/5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
             <Heart className="w-20 h-20 text-indigo-500" />
           </div>
           <div className="relative z-10 space-y-6">
             <h4 className="text-xl font-black text-indigo-900 flex items-center gap-3">
               <span className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg"><Heart className="w-5 h-5" /></span>
               أثر الآية في الوجدان
             </h4>
             <p className="text-indigo-950 text-justify font-serif text-xl leading-relaxed">
               {tafsirData.emotionalImpact}
             </p>
           </div>
        </section>

        <section className="bg-amber-50/40 p-8 rounded-[3.5rem] border-2 border-amber-100 shadow-xl shadow-amber-500/5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
             <Rocket className="w-20 h-20 text-amber-500" />
           </div>
           <div className="relative z-10 space-y-6">
             <h4 className="text-xl font-black text-amber-900 flex items-center gap-3">
               <span className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg"><Rocket className="w-5 h-5" /></span>
               خطوات عملية للتطبيق
             </h4>
             <p className="text-amber-950 text-justify font-serif text-xl leading-relaxed">
               {tafsirData.practicalSteps}
             </p>
           </div>
        </section>
      </div>
    </motion.div>
  );
}

function DimensionLab({ currentAyah, tafsirData, onNavigate }: { currentAyah?: Ayah, tafsirData: TafsirData | null, onNavigate?: (dir: 'next' | 'prev') => void }) {
  if (!tafsirData) return <EmptyState icon={Microscope} title="لطائف بيانية" description="اختر سورة وآية من شريط التحكم للتحليل الدقيق للألفاظ، الجذور، والبلاغة." />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20">
      <div className="flex items-center justify-between gap-4 py-4 px-2 bg-black/5 rounded-3xl">
        <Button variant="ghost" onClick={() => onNavigate?.('prev')} className="text-[#C18F59] font-bold"><ChevronRight className="ml-1" /> الآية السابقة</Button>
        <div className="text-sm font-bold text-gray-500">الآية {currentAyah?.numberInSurah}</div>
        <Button variant="ghost" onClick={() => onNavigate?.('next')} className="text-[#C18F59] font-bold">الآية التالية <ChevronLeft className="mr-1" /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           <Card className="bg-white/70 backdrop-blur-md border-none rounded-[2rem] shadow-xl">
             <CardHeader>
               <CardTitle className="text-2xl font-bold flex items-center gap-3">
                 <GitCompare className="w-6 h-6 text-[#C18F59]" />
                 المتشابهات اللفظية
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100">
                  <p className="font-serif text-xl text-amber-900/80 leading-relaxed italic text-justify">{tafsirData.mutashabihat}</p>
               </div>
             </CardContent>
           </Card>

           <Card className="bg-white/70 backdrop-blur-md border-none rounded-[2rem] shadow-xl">
             <CardHeader>
               <CardTitle className="text-2xl font-bold flex items-center gap-3">
                 <BrainCircuit className="w-6 h-6 text-blue-500" />
                 اللطائف البيانية
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="font-serif text-xl text-gray-700 leading-relaxed text-justify">{tafsirData.rhetoric}</p>
             </CardContent>
           </Card>
           
           <Card className="bg-white border-none rounded-[2rem] overflow-hidden shadow-sm">
             <CardHeader className="bg-black/5">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Component className="w-5 h-5 text-gray-500" />
                  خريطة العلاقات
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8">
                <div className="flex justify-center w-full">
                  <MermaidDiagram chart={tafsirData.mermaidDiagram} />
                </div>
             </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white/70 backdrop-blur-md rounded-[2rem] overflow-hidden border border-white/20 shadow-xl">
              <div className="bg-[#8B2635] p-6 text-white text-right">
                <h4 className="text-lg font-bold flex items-center gap-2 justify-end">
                  شرح المفردات
                  <Type className="w-5 h-5" />
                </h4>
              </div>
              <ScrollArea className="h-[600px]">
                <Accordion className="w-full">
                  {tafsirData.vocabularyAndRoots.map((item, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-black/5 last:border-b-0 px-6">
                      <AccordionTrigger className="hover:no-underline py-5 text-right flex-row-reverse" dir="rtl">
                        <div className="flex items-baseline gap-3 flex-row-reverse">
                          <span className="text-xl font-bold text-[#8B2635]">{item.word}</span>
                          <span className="text-xs font-bold text-[#C18F59] opacity-60">جذر: {item.root}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 space-y-4 text-right" dir="rtl">
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">الدلالة اللغوية</p>
                          <p className="text-sm text-gray-700 leading-relaxed font-medium italic text-right">{item.meaning}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] font-bold text-[#C18F59] uppercase tracking-widest">مفتاح الفهم</p>
                          <p className="text-sm text-gray-800 leading-relaxed text-right">{item.simplifiedExplanation}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none -z-10">
        <Icon className="w-96 h-96" />
      </div>
      
      <div className="relative">
        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-[#8B2635]/10 to-[#C18F59]/10 flex items-center justify-center text-[#8B2635] shadow-2xl">
          <Icon className="w-12 h-12" />
        </div>
        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-black/5">
          <Palette className="w-5 h-5 text-brand-primary" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-4xl font-black text-gray-800 tracking-tight">{title}</h3>
        <p className="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed font-medium">{description}</p>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-brand-primary/20 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
        ))}
      </div>
    </motion.div>
  );
}
