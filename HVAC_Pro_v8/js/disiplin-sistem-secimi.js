/**
 * Disiplin-Sistem Seçimi Modülü
 *
 * HVAC sistemlerinin disiplin türlerine göre uygun sistem seçeneklerini sağlar.
 * Referans: EN 12831 (ısıtma), VDI 2078 (soğutma), ASHRAE, NFPA 13 (yangın)
 *
 * Node.js uyumlu IIFE + module.exports
 */

(function () {
  'use strict';

  /**
   * Disiplin tanımları
   * @type {Array<{id: string, name: string}>}
   */
  const disciplines = [
    { id: 'heating', name: 'Heating' },
    { id: 'cooling', name: 'Cooling' },
    { id: 'ventilation', name: 'Ventilation' },
    { id: 'sanitary', name: 'Sanitary' },
    { id: 'fire', name: 'Fire' }
  ];

  /**
   * Sistem kataloğu (disiplin başına)
   * @type {Object<string, Array<{id: string, name: string, initialCost: string, operatingCost: string, comfort: string, flexibility: string}>>}
   */
  const systemCatalog = {
    heating: [
      {
        id: 'radiator-boiler',
        name: 'Radiator with Boiler',
        initialCost: 'low',
        operatingCost: 'medium',
        comfort: 'medium',
        flexibility: 'low'
      },
      {
        id: 'fancoil-chiller',
        name: 'Fancoil with Chiller (2-Pipe)',
        initialCost: 'medium',
        operatingCost: 'medium',
        comfort: 'high',
        flexibility: 'medium'
      },
      {
        id: 'vrf',
        name: 'VRF (Variable Refrigerant Flow)',
        initialCost: 'high',
        operatingCost: 'low',
        comfort: 'high',
        flexibility: 'high'
      },
      {
        id: 'radiant-floor',
        name: 'Radiant Floor Heating',
        initialCost: 'high',
        operatingCost: 'low',
        comfort: 'high',
        flexibility: 'low'
      }
    ],
    cooling: [
      {
        id: 'fancoil-chiller',
        name: 'Fancoil with Chiller (2-Pipe)',
        initialCost: 'medium',
        operatingCost: 'medium',
        comfort: 'high',
        flexibility: 'medium'
      },
      {
        id: 'vrf',
        name: 'VRF (Variable Refrigerant Flow)',
        initialCost: 'high',
        operatingCost: 'low',
        comfort: 'high',
        flexibility: 'high'
      },
      {
        id: 'radiant-panel',
        name: 'Radiant Cooling Panel',
        initialCost: 'medium',
        operatingCost: 'low',
        comfort: 'high',
        flexibility: 'low'
      },
      {
        id: 'split',
        name: 'Split System (Window / Wall Unit)',
        initialCost: 'low',
        operatingCost: 'medium',
        comfort: 'medium',
        flexibility: 'high'
      }
    ],
    ventilation: [
      {
        id: 'central',
        name: 'Central Mechanical Ventilation',
        initialCost: 'medium',
        operatingCost: 'medium',
        comfort: 'high',
        flexibility: 'medium'
      },
      {
        id: 'decentralized',
        name: 'Decentralized Ventilation',
        initialCost: 'low',
        operatingCost: 'medium',
        comfort: 'medium',
        flexibility: 'high'
      },
      {
        id: 'rotary-heat-recovery',
        name: 'Rotary Heat Recovery',
        initialCost: 'high',
        operatingCost: 'low',
        comfort: 'high',
        flexibility: 'medium'
      },
      {
        id: 'hybrid',
        name: 'Hybrid (Natural + Mechanical)',
        initialCost: 'medium',
        operatingCost: 'low',
        comfort: 'high',
        flexibility: 'medium'
      }
    ],
    sanitary: [
      {
        id: 'conventional',
        name: 'Conventional Water Supply & DHW (EN 806)',
        initialCost: 'low',
        operatingCost: 'medium',
        comfort: 'medium',
        flexibility: 'low'
      }
    ],
    fire: [
      {
        id: 'sprinkler-nfpa13',
        name: 'Automatic Sprinkler System (NFPA 13)',
        initialCost: 'medium',
        operatingCost: 'low',
        comfort: 'n/a',
        flexibility: 'low'
      },
      {
        id: 'hydrant',
        name: 'Hydrant System',
        initialCost: 'low',
        operatingCost: 'low',
        comfort: 'n/a',
        flexibility: 'low'
      },
      {
        id: 'gas-suppression',
        name: 'Gas Suppression System (FM-200 / Inergen)',
        initialCost: 'high',
        operatingCost: 'high',
        comfort: 'n/a',
        flexibility: 'low'
      }
    ]
  };

  /**
   * Tüm disiplinleri döndürür
   * @returns {Array<{id: string, name: string}>}
   */
  function getDisciplines() {
    return disciplines.slice(); // Klon dön
  }

  /**
   * Belirtilen disipline ait sistemleri döndürür
   * @param {string} disciplineId - Disiplin ID'si
   * @returns {Array|null} Sistem listesi veya null (geçersiz disiplin)
   */
  function getSystemsForDiscipline(disciplineId) {
    if (!systemCatalog.hasOwnProperty(disciplineId)) {
      return null; // Geçersiz disiplin
    }
    return systemCatalog[disciplineId].map(system => ({
      id: system.id,
      name: system.name,
      initialCost: system.initialCost,
      operatingCost: system.operatingCost,
      comfort: system.comfort,
      flexibility: system.flexibility
    }));
  }

  /**
   * Belirtilen disiplin ve sistem kombinasyonunu seçer
   * @param {string} disciplineId - Disiplin ID'si
   * @param {string} systemId - Sistem ID'si
   * @returns {Object|null} Seçilen sistem nesnesi veya null (geçersiz kombinasyon)
   */
  function selectSystem(disciplineId, systemId) {
    if (!systemCatalog.hasOwnProperty(disciplineId)) {
      return null; // Geçersiz disiplin
    }

    const systems = systemCatalog[disciplineId];
    const selected = systems.find(sys => sys.id === systemId);

    if (!selected) {
      return null; // Geçersiz sistem ID'si
    }

    return {
      disciplineId: disciplineId,
      disciplineName: disciplines.find(d => d.id === disciplineId).name,
      systemId: selected.id,
      systemName: selected.name,
      initialCost: selected.initialCost,
      operatingCost: selected.operatingCost,
      comfort: selected.comfort,
      flexibility: selected.flexibility
    };
  }

  /**
   * Belirtilen disiplin ve sistem kombinasyonunun geçerli olup olmadığını kontrol eder
   * @param {string} disciplineId - Disiplin ID'si
   * @param {string} systemId - Sistem ID'si
   * @returns {boolean}
   */
  function isValidCombination(disciplineId, systemId) {
    if (!systemCatalog.hasOwnProperty(disciplineId)) {
      return false;
    }
    return systemCatalog[disciplineId].some(sys => sys.id === systemId);
  }

  // ============================================================================
  // Node.js Exports
  // ============================================================================
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      getDisciplines: getDisciplines,
      getSystemsForDiscipline: getSystemsForDiscipline,
      selectSystem: selectSystem,
      isValidCombination: isValidCombination
    };
  }

})();
