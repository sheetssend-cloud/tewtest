import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Download, RefreshCw, AlertCircle, CheckCircle2, Lock, Palette } from 'lucide-react';
import { Header } from './components/Header';
import { Spinner } from './components/Spinner';
import { generateCoverImage } from './services/geminiService';
import { CoverFormData, GenerationState } from './types';

const App: React.FC = () => {
  // State
  const [formData, setFormData] = useState<CoverFormData>({
    position: '',
    organization: '',
    colorTone: '',
    logoData: null,
  });
  
  const [generationState, setGenerationState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    imageUrl: null,
  });

  // Initialize Default Logo on Mount
  useEffect(() => {
    const generateDefaultLogo = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Background (Transparent)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw simple "OPEN SHEETS" logo representation
        // This ensures we always have the correct logo to send to Gemini
        
        // Text shadow for visibility
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw Box border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 380, 180);

        // Draw Text
        ctx.fillStyle = '#000';
        ctx.fillText('OPEN SHEETS', 200, 100);
        
        const dataUrl = canvas.toDataURL('image/png');
        setFormData(prev => ({ ...prev, logoData: dataUrl }));
      }
    };

    generateDefaultLogo();
  }, []);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const executeGeneration = async () => {
    if (!formData.logoData || !formData.position || !formData.organization) {
      setGenerationState(prev => ({ ...prev, error: 'กรุณากรอกข้อมูลตำแหน่งและหน่วยงานให้ครบถ้วน' }));
      return;
    }

    // Set loading and clear previous image/error
    setGenerationState({ isLoading: true, error: null, imageUrl: null });

    try {
      const generatedImage = await generateCoverImage(
        formData.logoData,
        formData.position,
        formData.organization,
        formData.colorTone
      );
      setGenerationState({ isLoading: false, error: null, imageUrl: generatedImage });
    } catch (err: any) {
      setGenerationState({ isLoading: false, error: err.message, imageUrl: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeGeneration();
  };

  const handleDownload = () => {
    if (generationState.imageUrl) {
      const link = document.createElement('a');
      link.href = generationState.imageUrl;
      link.download = `ปกสอบ_${formData.position.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                ข้อมูลหน้าปก
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Static Logo Display */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      1. โลโก้ (กำหนดค่าเริ่มต้น)
                    </label>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <div className="h-16 w-16 bg-white border border-slate-200 flex items-center justify-center rounded overflow-hidden">
                        {formData.logoData ? (
                          <img src={formData.logoData} alt="Open Sheets Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 animate-pulse"></div>
                        )}
                     </div>
                     <div>
                       <p className="font-bold text-slate-800">OPEN SHEETS</p>
                       <p className="text-xs text-slate-500">ใช้โลโก้มาตรฐานสำหรับทุกหน้าปก</p>
                     </div>
                  </div>
                </div>

                {/* Position Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    2. ชื่อตำแหน่ง (ไม่ต้องใส่คำว่า "ตำแหน่ง")
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="เช่น เจ้าหน้าที่ศาลยุติธรรมปฏิบัติงาน"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Organization Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    3. ชื่อหน่วยงาน
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="เช่น สำนักงานศาลยุติธรรม"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Color Tone Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    4. โทนสี <span className="text-slate-400 text-xs font-normal">(ระบุหรือไม่ก็ได้)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Palette className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="colorTone"
                      value={formData.colorTone}
                      onChange={handleInputChange}
                      placeholder="เช่น สีแดงเลือดหมู, สีทอง, สีน้ำเงินเข้ม"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">หากไม่ระบุ ระบบจะเลือกสีตามชื่อหน่วยงาน</p>
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={generationState.isLoading || !formData.logoData}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {generationState.isLoading ? (
                    <>
                      <Spinner /> กำลังสร้างภาพ...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" /> สร้างปกหนังสือ
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="text-indigo-800 font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                คำแนะนำ
              </h3>
              <ul className="text-xs text-indigo-700 space-y-1 list-disc list-inside">
                <li>ระบบใช้โลโก้ "OPEN SHEETS" เป็นค่าเริ่มต้น</li>
                <li>สามารถระบุโทนสีที่ต้องการได้ (เช่น แดง, เขียว, ทอง)</li>
                <li>ภาพที่ได้เป็นลิขสิทธิ์ของคุณ สามารถนำไปใช้พิมพ์ได้ทันที</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full min-h-[600px] flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-500" />
                  ผลลัพธ์
                </h2>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  {generationState.imageUrl && !generationState.isLoading && (
                    <button
                      onClick={executeGeneration}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> สร้างใหม่
                    </button>
                  )}
                  
                  {generationState.imageUrl && (
                    <button
                      onClick={handleDownload}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> ดาวน์โหลดภาพ
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-grow flex items-center justify-center bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 overflow-hidden relative">
                {generationState.isLoading ? (
                  <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-white rounded-full shadow-lg">
                      <Spinner />
                    </div>
                    <p className="text-slate-600 animate-pulse font-medium">กำลังวิเคราะห์ข้อมูลและสร้างกราฟิก 3D...</p>
                    <p className="text-xs text-slate-400">อาจใช้เวลา 10-20 วินาที</p>
                  </div>
                ) : generationState.error ? (
                  <div className="text-center p-8 max-w-md">
                    <div className="bg-red-100 text-red-600 p-4 rounded-full inline-block mb-4">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">เกิดข้อผิดพลาด</h3>
                    <p className="text-red-600 mb-4">{generationState.error}</p>
                    <button 
                      onClick={() => setGenerationState(prev => ({ ...prev, error: null }))}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      ลองใหม่อีกครั้ง
                    </button>
                  </div>
                ) : generationState.imageUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center p-4 group">
                     <img 
                      src={generationState.imageUrl} 
                      alt="Generated Book Cover" 
                      className="max-h-full shadow-2xl rounded-sm object-contain"
                    />
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 backdrop-blur-sm">
                       <CheckCircle2 className="w-4 h-4 text-green-400" />
                       พร้อมดาวน์โหลด
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 p-8">
                    <div className="bg-slate-50 p-6 rounded-full inline-block mb-4">
                      <ImageIcon className="w-12 h-12 opacity-50" />
                    </div>
                    <p className="font-medium">ยังไม่มีรูปภาพ</p>
                    <p className="text-sm mt-1">กรอกข้อมูลตำแหน่งและหน่วยงานเพื่อเริ่มสร้าง</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-6 mt-8">
        <div className="container mx-auto text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} ExamCoverAI. Powered by Google Gemini 3 Pro.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;