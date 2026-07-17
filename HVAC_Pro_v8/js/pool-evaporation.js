// ═══════════════════════════════════════════════════════════════════════════
// HVAC Hesap Pro — Havuz Buharlaşması Hesapla (pool-evaporation.js)
// VDI 2089 lineer yaklaşım: W = k × A × (Pv_su - Pv_hava) × f
// ═══════════════════════════════════════════════════════════════════════════

(function(){

  /**
   * Havuz buharlaşma oranını hesapla (VDI 2089 lineer model)
   * @param {Object} opts
   * @param {number} opts.havuzAlaniM2 - Havuz alanı (m²)
   * @param {number} opts.buharBasinciSu_Pa - Su yüzeyindeki buhar basıncı (Pa)
   * @param {number} opts.buharBasinciHava_Pa - Havanın buhar basıncı (Pa)
   * @param {number} [opts.aktiviteFaktor=1] - Aktivite/kirlilik faktörü (0–2)
   * @param {number} [opts.konvKatsayi=0.09] - Konveksiyon katsayısı
   *   Tipik VDI 2089 aralığı: 0.05–0.15 (kg/(h·m²·Pa))
   *   Varsayılan: 0.09 (orta koşullar)
   *   Kullanıcı teyit etmeli ve proje koşullarına göre ayarlamalı.
   * @returns {Object|null} {buharlas_kg_per_h, varsayimlar} veya {error}
   *   Negatif sonuç 0'a kırpılır.
   *   Geçersiz girdi null dönür.
   */
  function calc(opts) {
    if (!opts || typeof opts !== 'object') {
      return { error: 'Geçersiz girdi: opts nesnesi gerekli' };
    }

    const {
      havuzAlaniM2,
      buharBasinciSu_Pa,
      buharBasinciHava_Pa,
      aktiviteFaktor = 1,
      konvKatsayi = 0.09
    } = opts;

    // ─── Girdi doğrulama ─────────────────────────────────────────
    if (typeof havuzAlaniM2 !== 'number' || havuzAlaniM2 < 0) {
      return { error: 'havuzAlaniM2 geçersiz: negatif olmayan sayı olmalı' };
    }
    if (typeof buharBasinciSu_Pa !== 'number' || buharBasinciSu_Pa < 0) {
      return { error: 'buharBasinciSu_Pa geçersiz: negatif olmayan sayı olmalı' };
    }
    if (typeof buharBasinciHava_Pa !== 'number' || buharBasinciHava_Pa < 0) {
      return { error: 'buharBasinciHava_Pa geçersiz: negatif olmayan sayı olmalı' };
    }
    if (typeof aktiviteFaktor !== 'number' || aktiviteFaktor < 0) {
      return { error: 'aktiviteFaktor geçersiz: negatif olmayan sayı olmalı' };
    }
    if (typeof konvKatsayi !== 'number' || konvKatsayi <= 0) {
      return { error: 'konvKatsayi geçersiz: pozitif sayı olmalı' };
    }

    // ─── Hesap ──────────────────────────────────────────────────
    // VDI 2089: W = k × A × (Pv_su - Pv_hava) / 1000 × f
    // (1000 ile bölme: Pa cinsinden basınç farkını bar'a çevirmek için)
    const buharlasBasis =
      konvKatsayi * havuzAlaniM2 * (buharBasinciSu_Pa - buharBasinciHava_Pa) / 1000 * aktiviteFaktor;

    // Negatif sonuç 0'a kırp (su yüzeyinde konden oluşsa da tekil senaryo)
    const buharlasmaKgPerH = Math.max(0, buharlasBasis);

    return {
      buharlas_kg_per_h: Math.round(buharlasmaKgPerH * 1000) / 1000, // 3 ondalık basamak
      varsayimlar: {
        havuzAlaniM2,
        buharBasinciSu_Pa,
        buharBasinciHava_Pa,
        aktiviteFaktor,
        konvKatsayi,
        dipNot: 'konvKatsayi VDI 2089 tipik aralığı 0.05–0.15 kg/(h·m²·Pa). Proje koşullarına göre kullanıcı teyit etmeli.'
      }
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EXPORT
  // ══════════════════════════════════════════════════════════════════════════
  if (typeof window !== 'undefined') {
    window.PoolEvaporation = { calc };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calc };
  }

})();
