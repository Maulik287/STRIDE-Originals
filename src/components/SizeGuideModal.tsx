import React, { useState } from 'react';
import { X, Ruler, Footprints, Info } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  gender: string;
}

const SIZE_CHART = [
  { usMen: '6.0', usWomen: '7.0', uk: '5.5', eu: '38.7', cm: '24.0' },
  { usMen: '6.5', usWomen: '7.5', uk: '6.0', eu: '39.3', cm: '24.5' },
  { usMen: '7.0', usWomen: '8.0', uk: '6.5', eu: '40.0', cm: '25.0' },
  { usMen: '7.5', usWomen: '8.5', uk: '7.0', eu: '40.7', cm: '25.5' },
  { usMen: '8.0', usWomen: '9.0', uk: '7.5', eu: '41.3', cm: '26.0' },
  { usMen: '8.5', usWomen: '9.5', uk: '8.0', eu: '42.0', cm: '26.5' },
  { usMen: '9.0', usWomen: '10.0', uk: '8.5', eu: '42.7', cm: '27.0' },
  { usMen: '9.5', usWomen: '10.5', uk: '9.0', eu: '43.3', cm: '27.5' },
  { usMen: '10.0', usWomen: '11.0', uk: '9.5', eu: '44.0', cm: '28.0' },
  { usMen: '10.5', usWomen: '11.5', uk: '10.0', eu: '44.7', cm: '28.5' },
  { usMen: '11.0', usWomen: '12.0', uk: '10.5', eu: '45.3', cm: '29.0' },
  { usMen: '12.0', usWomen: '13.0', uk: '11.5', eu: '46.7', cm: '30.0' },
];

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, gender }) => {
  const [selectedUnit, setSelectedUnit] = useState<'men' | 'women'>(
    gender.toLowerCase().includes('women') ? 'women' : 'men'
  );

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-hidden"
      data-lenis-prevent="true"
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in-50 zoom-in-95"
        data-lenis-prevent="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-neutral-900" />
            <h3 className="font-display text-lg font-bold uppercase tracking-tight text-neutral-900">
              Footwear Size & Measurement Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div 
          data-lenis-prevent="true"
          className="p-6 space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain"
        >
          {/* Gender selection switch */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Primary Sizing Standard:
            </span>
            <div className="inline-flex p-1 bg-neutral-100 rounded-lg">
              <button
                onClick={() => setSelectedUnit('men')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  selectedUnit === 'men' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Men's / Unisex US
              </button>
              <button
                onClick={() => setSelectedUnit('women')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  selectedUnit === 'women' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Women's US
              </button>
            </div>
          </div>

          {/* Size Conversion Table */}
          <div className="overflow-x-auto border border-neutral-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-900 text-white font-bold uppercase tracking-wider">
                  <th className="p-3">US {selectedUnit === 'men' ? 'Men' : 'Women'}</th>
                  <th className="p-3">UK</th>
                  <th className="p-3">EU</th>
                  <th className="p-3">CM (Heel-To-Toe)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {SIZE_CHART.map((row, idx) => (
                  <tr
                    key={row.usMen}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/80 hover:bg-neutral-100/60'}
                  >
                    <td className="p-3 font-extrabold text-neutral-900">
                      {selectedUnit === 'men' ? row.usMen : row.usWomen}
                    </td>
                    <td className="p-3 text-neutral-700">{row.uk}</td>
                    <td className="p-3 text-neutral-700">{row.eu}</td>
                    <td className="p-3 text-neutral-900 font-semibold">{row.cm} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to measure guide */}
          <div className="p-4 bg-neutral-100 rounded-xl flex items-start gap-3">
            <Footprints className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-600 space-y-1">
              <p className="font-bold text-neutral-900 uppercase tracking-wide">
                How to measure your foot accurately:
              </p>
              <p>
                1. Place a blank sheet of paper on a hard floor against a wall.
              </p>
              <p>
                2. Step barefoot or with socks on the paper with your heel firmly touching the wall.
              </p>
              <p>
                3. Mark the longest part of your foot (tip of the big toe) and measure the distance in centimeters.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
