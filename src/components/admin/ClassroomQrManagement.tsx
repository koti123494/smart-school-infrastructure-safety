import React, { useMemo, useState } from 'react';
import { Download, Printer, QrCode, RefreshCw, Search, CheckCircle2, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { getClassroomQrCode, getClassroomReportUrl } from '../../data/classroomQr';
import { Classroom } from '../../types';

export const ClassroomQrManagement: React.FC = () => {
  const { classrooms } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState<Record<string, string>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const filteredClassrooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return classrooms;
    return classrooms.filter((classroom) =>
      `${classroom.roomNumber} ${classroom.buildingName} ${getClassroomQrCode(classroom)}`
        .toLowerCase()
        .includes(query)
    );
  }, [classrooms, searchQuery]);

  const generateQr = async (classroom: Classroom) => {
    setGeneratingId(classroom.id);
    setMessage('');
    try {
      const dataUrl = await QRCode.toDataURL(getClassroomReportUrl(classroom), {
        width: 360,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      setGeneratedCodes((previous) => ({ ...previous, [classroom.id]: dataUrl }));
      setMessage(`QR code ready for ${classroom.roomNumber}.`);
    } catch {
      setMessage(`Unable to generate a QR code for ${classroom.roomNumber}.`);
    } finally {
      setGeneratingId(null);
    }
  };

  const generateAll = async () => {
    for (const classroom of filteredClassrooms) {
      await generateQr(classroom);
    }
  };

  const downloadQr = (classroom: Classroom) => {
    const dataUrl = generatedCodes[classroom.id];
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `classroom-${getClassroomQrCode(classroom)}-qr.png`;
    link.click();
  };

  const printQr = (classroom: Classroom) => {
    const dataUrl = generatedCodes[classroom.id];
    if (!dataUrl) return;
    const printWindow = window.open('', '_blank', 'width=520,height=700');
    if (!printWindow) {
      setMessage('Allow pop-ups to print the classroom QR code.');
      return;
    }
    printWindow.document.write(`
      <!doctype html><html><head><title>${classroom.roomNumber} QR Code</title>
      <style>body{font-family:Arial,sans-serif;text-align:center;padding:32px;color:#0f172a}img{width:320px;height:320px}h1{font-size:24px;margin:0 0 8px}p{color:#475569;margin:6px}</style>
      </head><body><h1>${classroom.roomNumber}</h1><p>${classroom.buildingName} • ${getClassroomQrCode(classroom)}</p><img src="${dataUrl}" alt="Classroom QR code" /><p>Scan to report a problem in this classroom.</p></body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">QR Classroom Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Admin Tools</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Create classroom-specific reporting links without putting sensitive information in the QR code.</p>
        </div>
        <button
          type="button"
          onClick={generateAll}
          disabled={filteredClassrooms.length === 0 || generatingId !== null}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Generate Visible QR Codes
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search classroom or QR key, e.g. A101"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="text-xs text-slate-500">{filteredClassrooms.length} classroom records</div>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      {filteredClassrooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-500">No classrooms match this search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClassrooms.map((classroom) => {
            const qr = generatedCodes[classroom.id];
            const code = getClassroomQrCode(classroom);
            return (
              <article key={classroom.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 flex items-start justify-between gap-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{classroom.roomNumber}</h2>
                    <p className="text-xs text-slate-500 mt-1">{classroom.buildingName} • Floor {classroom.floor}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${qr ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {qr ? 'Generated' : 'Not generated'}
                  </span>
                </div>
                <div className="p-5 flex-1">
                  <div className="aspect-square max-w-[220px] mx-auto rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {qr ? <img src={qr} alt={`${classroom.roomNumber} QR code`} className="w-full h-full object-contain p-3" /> : <QrCode className="w-20 h-20 text-slate-300" />}
                  </div>
                  <div className="mt-4 text-center">
                    <span className="font-mono text-sm font-bold text-blue-700">{code}</span>
                    <p className="text-[11px] text-slate-500 mt-1">Opens the classroom report form</p>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => generateQr(classroom)} disabled={generatingId === classroom.id} className="px-2 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-[11px] font-bold flex items-center justify-center gap-1">
                    {qr ? <RefreshCw className="w-3.5 h-3.5" /> : <QrCode className="w-3.5 h-3.5" />} {qr ? 'Regenerate' : 'Generate'}
                  </button>
                  <button type="button" onClick={() => downloadQr(classroom)} disabled={!qr} className="px-2 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button type="button" onClick={() => printQr(classroom)} disabled={!qr} className="px-2 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
