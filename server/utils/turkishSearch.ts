/**
 * Türkçe karakter duyarsız ve çok kelimeli arama yardımcıları
 * Dentaline 2 - Patient Search Utility
 */

export interface TurkishRegexOptions {
  wordStart?: boolean;
  allowAsciiToTurkish?: boolean;
}

/**
 * Türkçe ve İngilizce karakter varyasyonlarını (I/İ/ı/i, Ç/C/ç/c vb.)
 * kapsayan esnek bir RegExp üretir.
 */
export function makeTurkishRegex(text: string, options: TurkishRegexOptions = {}): RegExp {
  const { wordStart = false, allowAsciiToTurkish = true } = options;
  const clean = (text || '').normalize('NFC').replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');

  let pattern = '';
  for (const ch of clean) {
    if (ch === 'i' || ch === 'İ' || ch === 'ı' || ch === 'I') {
      pattern += '[iİıI]';
    } else if (ch === 'ç' || ch === 'Ç') {
      pattern += '[çÇ]';
    } else if (ch === 'c' || ch === 'C') {
      pattern += allowAsciiToTurkish ? '[cCçÇ]' : '[cC]';
    } else if (ch === 'ğ' || ch === 'Ğ') {
      pattern += '[ğĞ]';
    } else if (ch === 'g' || ch === 'G') {
      pattern += allowAsciiToTurkish ? '[gGğĞ]' : '[gG]';
    } else if (ch === 'ö' || ch === 'Ö') {
      pattern += '[öÖ]';
    } else if (ch === 'o' || ch === 'O') {
      pattern += allowAsciiToTurkish ? '[oOöÖ]' : '[oO]';
    } else if (ch === 'ü' || ch === 'Ü') {
      pattern += '[üÜ]';
    } else if (ch === 'u' || ch === 'U') {
      pattern += allowAsciiToTurkish ? '[uUüÜ]' : '[uU]';
    } else if (ch === 'ş' || ch === 'Ş') {
      pattern += '[şŞ]';
    } else if (ch === 's' || ch === 'S') {
      pattern += allowAsciiToTurkish ? '[sSşŞ]' : '[sS]';
    } else {
      pattern += ch;
    }
  }

  if (wordStart) {
    return new RegExp('(^|\\s)' + pattern, 'i');
  }
  return new RegExp(pattern, 'i');
}

/**
 * MongoDB Patient koleksiyonu için çok kelimeli, harf duyarsız ve
 * telefon/TC toleranslı arama filtresi oluşturur.
 *
 * Örneğin:
 * - "FATMA ÇELİK" -> Fatma ÇELİK hastasını bulur (2 ayrı kelimeyi fullName veya firstName/lastName üzerinden eşler)
 * - "fatma ç" -> Adı Fatma olup soyadı veya ikinci adı Ç ile başlayanları bulur ("Fatma ÇELİK", "Fatma ÇETİN")
 * - "FATMA CELIK" -> İngilizce C ve I ile yazılsa bile bulur
 * - "çelik fatma" -> Soyadı önce yazılsa bile bulur
 * - "0538 633" veya "05386338244" -> Telefon numarasını bulur
 */
export function buildPatientSearchFilter(rawQuery: string): any {
  const q = (rawQuery || '').trim();
  if (!q) return {};

  const words = q.split(/\s+/).filter(Boolean);
  if (words.length === 0) return {};

  const digits = q.replace(/\D/g, '');

  const wordConditions = words.map(w => {
    // 1 veya 2 harfli aramaları kelime başlangıcı olarak al (örn: "fatma ç" -> ç ile başlayan soyadlar)
    const isShort = w.length <= 2;
    const nameRx = makeTurkishRegex(w, { wordStart: isShort });
    const fullRx = makeTurkishRegex(w, { wordStart: false });

    return {
      $or: [
        { fullName: nameRx },
        { firstName: isShort ? new RegExp('^' + makeTurkishRegex(w).source, 'i') : fullRx },
        { lastName: isShort ? new RegExp('^' + makeTurkishRegex(w).source, 'i') : fullRx },
        { phone: fullRx },
        { tcNo: fullRx }
      ]
    };
  });

  // Eğer aramada en az 3 basamaklı rakam varsa ve arama terimi sadece düz rakamdan ibaret değilse
  // (örn "0538 633 82 44" gibi boşluklu formatlanmış aramalarda) telefon ve TC'yi de kapsar
  if (digits.length >= 3 && digits !== q) {
    const digitRx = new RegExp(digits, 'i');
    return {
      $or: [
        { $and: wordConditions },
        { phone: digitRx },
        { tcNo: digitRx }
      ]
    };
  }

  if (wordConditions.length === 1) {
    return wordConditions[0];
  }

  return { $and: wordConditions };
}

/**
 * JavaScript içinde istemci tarafı arama normalizasyonu için yardımcı
 */
export function normalizeTurkish(text: string = ''): string {
  return String(text || '')
    .normalize('NFC')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .toLocaleLowerCase('tr-TR')
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}
