;;; ================================================================
;;; UFH-BORU.lsp  –  Yerden Isitma Boru Deseni Cizimi
;;; HVAC Hesap Pro  |  EN 1264 Serpantin Desen
;;; ZwCAD 2022+ / AutoCAD 2010+ uyumlu
;;; ----------------------------------------------------------------
;;; BIRIM SİSTEMİ: Cizim CM'dir.
;;;   300 mm adim = 30 cizim birimi
;;;   100 mm adim = 10 cizim birimi
;;;   Devreler arasi mesafe = 10 birim (= 10 cm = 100 mm)
;;; ----------------------------------------------------------------
;;; KULLANIM:
;;;   1. Önce kolektör güzergahını cizin:
;;;        PLINE komutu → oda içinden başlayın → kollektöre
;;;        kadar çizin → Enter ile kapatın (çizginin kapanmasına
;;;        gerek yok, açık polyline olabilir)
;;;
;;;   2. UFH-BORU komutunu calistirin:
;;;      a) UFH-ETIKET etiketi secin  (adim + devre xdata'dan okunur)
;;;      b) Oda sinir polyline'ini secin  (kapali LWPOLYLINE)
;;;      c) Kolektör güzergah polyline'ini secin  (az önce cizilen)
;;;
;;;   3. Sonuc:
;;;      - Oda içi serpantin boru deseni  (UFH-BORU  kirmizi)
;;;      - Güzergah boyunca gidis/donus borulari (UFH-GIDIS mavi)
;;;        Devre sayisina göre yan yana, 10cm aralikla
;;; ================================================================


;; ---------------------------------------------------------------
;; YARDIMCI: LWPOLYLINE tüm koselerini (x y) listesi olarak al
;; ---------------------------------------------------------------
(defun ufh:get-verts (ent / ed verts)
  (setq ed (entget ent) verts '())
  (foreach x ed
    (if (= (car x) 10)
      (setq verts (append verts (list (list (cadr x) (caddr x)))))))
  verts)


;; ---------------------------------------------------------------
;; YARDIMCI: Yatay tarama y'sinin, kenar p1->p2 ile kesiştigi x
;; ---------------------------------------------------------------
(defun ufh:edge-x (p1 p2 y / x1 y1 x2 y2)
  (setq x1 (car p1) y1 (cadr p1)
        x2 (car p2) y2 (cadr p2))
  (if (and (not (equal y1 y2 1e-9))
           (<  (min y1 y2) y)
           (<= y (max y1 y2)))
    (+ x1 (* (/ (- y y1) (- y2 y1)) (- x2 x1)))
    nil))


;; ---------------------------------------------------------------
;; YARDIMCI: Poligonun y duzlemindeki tüm x kesismelerini sirala
;; ---------------------------------------------------------------
(defun ufh:intersections (verts y / n i xs ix)
  (setq xs '() n (length verts) i 0)
  (while (< i n)
    (setq ix (ufh:edge-x (nth i verts) (nth (rem (1+ i) n) verts) y))
    (if ix (setq xs (cons ix xs)))
    (setq i (1+ i)))
  (vl-sort xs '<))


;; ---------------------------------------------------------------
;; YARDIMCI: Segment normalini (birim dik vektor) hesapla
;;   Sola dönük normal: (-dy, dx) / len
;; ---------------------------------------------------------------
(defun ufh:seg-normal (p1 p2 / dx dy len)
  (setq dx (- (car p2) (car p1))
        dy (- (cadr p2) (cadr p1))
        len (sqrt (+ (* dx dx) (* dy dy))))
  (if (> len 1e-10)
    (list (/ (- dy) len) (/ dx len))
    '(0.0 1.0)))


;; ---------------------------------------------------------------
;; YARDIMCI: Cok noktalı polyline'ı belirli mesafe offset'le
;;   Her kose noktasında komsu segmentlerin ortalama normali
;;   kullanilir (miter).
;;   pts    : ((x1 y1) (x2 y2) ...)
;;   offset : cizim birimi cinsinden (cm)
;; ---------------------------------------------------------------
(defun ufh:offset-pts (pts offset / n i p0 p1 p2 n1 n2 na nx ny nl result)
  (setq n (length pts) i 0 result '())
  (while (< i n)
    (setq p1 (nth i pts))
    (cond
      ;; Ilk nokta
      ((= i 0)
       (setq n1 (ufh:seg-normal p1 (nth 1 pts)))
       (setq nx (car n1) ny (cadr n1)))
      ;; Son nokta
      ((= i (1- n))
       (setq n1 (ufh:seg-normal (nth (1- i) pts) p1))
       (setq nx (car n1) ny (cadr n1)))
      ;; Ara nokta: miter ortalama
      (t
       (setq n1 (ufh:seg-normal (nth (1- i) pts) p1)
             n2 (ufh:seg-normal p1 (nth (1+ i) pts))
             nx (/ (+ (car n1) (car n2)) 2.0)
             ny (/ (+ (cadr n1) (cadr n2)) 2.0)
             nl (sqrt (+ (* nx nx) (* ny ny))))
       (if (> nl 1e-10)
         (setq nx (/ nx nl) ny (/ ny nl))
         (setq nx (car n1) ny (cadr n1)))))
    (setq result
      (append result
        (list (list (+ (car p1) (* nx offset))
                    (+ (cadr p1) (* ny offset))))))
    (setq i (1+ i)))
  result)


;; ---------------------------------------------------------------
;; YARDIMCI: Nokta listesinden LINE segmentleri ciz
;; ---------------------------------------------------------------
(defun ufh:draw-segs (pts layer color / i)
  (setq i 0)
  (while (< i (1- (length pts)))
    (entmake
      (list '(0 . "LINE")
            (cons 8  layer)
            (cons 62 color)
            (cons 10 (list (car  (nth i       pts))
                           (cadr (nth i       pts)) 0.0))
            (cons 11 (list (car  (nth (1+ i)  pts))
                           (cadr (nth (1+ i)  pts)) 0.0))))
    (setq i (1+ i))))


;; ---------------------------------------------------------------
;; ANA CIZIM 1: Oda içi serpantin boru deseni
;;   verts      : oda kose listesi
;;   spacing-cm : boru adimi CM cinsinden (= mm / 10)
;; ---------------------------------------------------------------
(defun ufh:draw-serpantin (verts spacing-cm / xmin ymin xmax ymax
                            y go-right xs xa xb
                            pex pey csx csy cex cey n-rows)
  (setq xmin 1e30 ymin 1e30 xmax -1e30 ymax -1e30)
  (foreach v verts
    (setq xmin (min xmin (car  v)) ymin (min ymin (cadr v))
          xmax (max xmax (car  v)) ymax (max ymax (cadr v))))

  (setq y        (+ ymin (* spacing-cm 0.5))
        go-right t
        pex      nil
        pey      nil
        n-rows   0)

  (while (< y (- ymax (* spacing-cm 0.3)))
    (setq xs (ufh:intersections verts y))
    (when (>= (length xs) 2)
      (setq xa (car xs) xb (last xs))
      (if go-right
        (setq csx xa csy y cex xb cey y)
        (setq csx xb csy y cex xa cey y))
      ;; Donus baglantisi (onceki satir bitis -> bu baslangic)
      (if pex
        (entmake (list '(0 . "LINE") (cons 8 "UFH-DONUS") (cons 62 4)
                       (cons 10 (list pex pey 0.0))
                       (cons 11 (list csx csy 0.0)))))
      ;; Ana boru
      (entmake (list '(0 . "LINE") (cons 8 "UFH-BORU") (cons 62 1)
                     (cons 10 (list csx csy 0.0))
                     (cons 11 (list cex cey 0.0))))
      (setq pex cex pey cey
            go-right (not go-right)
            n-rows   (1+ n-rows)))
    (setq y (+ y spacing-cm)))
  n-rows)


;; ---------------------------------------------------------------
;; ANA CIZIM 2: Güzergah boyunca gidiş/dönüş boru cizgileri
;;   route-pts  : güzergah polyline noktalari
;;   n-circuits : devre sayisi
;;   Toplam boru sayisi = 2 × n-circuits
;;   Boru aralikları  = 10 birim (cm) → 100 mm
;;   Simetrik dizilim güzergah centerline etrafinda
;;
;;   Renk: UFH-GIDIS katmanı, ACI-5 (mavi)
;; ---------------------------------------------------------------
(defun ufh:draw-route (route-pts n-circuits / n-pipes offsets i ofs pts)
  (setq n-pipes (* 2 n-circuits))
  ;; Ofset degerleri: simetrik, 10 birim aralikli
  ;; Ornek 1 devre: [-5, +5]
  ;; Ornek 2 devre: [-15, -5, +5, +15]
  ;; Ornek 3 devre: [-25, -15, -5, +5, +15, +25]
  (setq offsets '() i 0)
  (while (< i n-pipes)
    (setq offsets
      (append offsets
        (list (* (- i (/ (- n-pipes 1) 2.0)) 10.0))))
    (setq i (1+ i)))

  (foreach ofs offsets
    (setq pts (ufh:offset-pts route-pts ofs))
    (ufh:draw-segs pts "UFH-GIDIS" 5)))


;; ---------------------------------------------------------------
;; KOMUT: UFH-BORU
;; ---------------------------------------------------------------
(defun c:UFH-BORU (/ *error*
                     sel-res sel-ent xd-raw xd-app
                     spacing-mm spacing-cm n-circuits
                     poly-sel poly-ent verts
                     route-sel route-ent route-pts
                     n-rows)

  (defun *error* (msg)
    (if (not (member msg '("Function cancelled" "quit / exit abort")))
      (princ (strcat "\n[UFH-BORU] HATA: " msg)))
    (princ))

  (vl-load-com)

  ;; Katmanlar
  (defun mk-lay (nm col)
    (if (not (tblsearch "LAYER" nm))
      (entmake (list '(0 . "LAYER") (cons 2 nm) '(70 . 0)
                     (cons 62 col) (cons 6 "CONTINUOUS")))))
  (mk-lay "UFH-BORU"   1)   ; kirmizi  – oda içi boru
  (mk-lay "UFH-DONUS"  4)   ; cyan     – donus baglantilari
  (mk-lay "UFH-GIDIS"  5)   ; mavi     – kolektör guzergah borular

  ;; ---- ADIM 1: Etiket seç → adim + devre xdata ----
  (setq spacing-mm nil n-circuits nil)

  (princ "\n[1/3] UFH-ETIKET etiketi secin  <Enter=degerleri manuel gir>: ")
  (setq sel-res (entsel))

  (if sel-res
    (progn
      (setq xd-raw (cdr (assoc -3 (entget (car sel-res) '("HVAC_UFH")))))
      (if xd-raw
        (progn
          (setq xd-app (cdar xd-raw))
          ;; Xdata yapisi: 1000=mn, 1000=ma, 1040=adim, 1040=devre, ...
          (setq spacing-mm  (cdr (nth 2 xd-app))   ; 3. eleman = adim mm
                n-circuits  (fix (cdr (nth 3 xd-app)))) ; 4. eleman = devre
          (princ (strcat "\n  Adim    : " (rtos spacing-mm 2 0) " mm"))
          (princ (strcat "\n  Devreler: " (itoa n-circuits)))
        )
        (princ "\n  Xdata bulunamadi – manuel girilecek."))))

  ;; Manuel giris
  (if (not spacing-mm)
    (progn
      (setq spacing-mm (getreal "\n  Boru adimi (mm)  100 / 150 / 200 / 250 / 300  <100>: "))
      (if (not spacing-mm) (setq spacing-mm 100.0))))
  (if (not n-circuits)
    (progn
      (setq n-circuits (getint "\n  Devre sayisi  <1>: "))
      (if (not n-circuits) (setq n-circuits 1))))

  ;; MM → CM (cizim birimi cm)
  (setq spacing-cm (/ spacing-mm 10.0))
  (princ (strcat "\n  Cizim birimi CM  |  " (rtos spacing-mm 2 0)
                 " mm = " (rtos spacing-cm 2 1) " birim"))

  ;; ---- ADIM 2: Oda sinir polyline ----
  (princ "\n\n[2/3] Oda sinir polyline'ini secin (kapali LWPOLYLINE): ")
  (setq poly-sel (entsel))
  (if (not poly-sel) (progn (princ "\nIptal.") (exit)))
  (setq poly-ent (car poly-sel))

  (if (not (equal (cdr (assoc 0 (entget poly-ent))) "LWPOLYLINE"))
    (progn (princ "\nHATA: LWPOLYLINE secilmeli!") (exit)))

  (setq verts (ufh:get-verts poly-ent))
  (if (< (length verts) 3)
    (progn (princ "\nPolyline yeterli kose icermiyor!") (exit)))
  (princ (strcat " -> " (itoa (length verts)) " kose."))

  ;; ---- ADIM 3: Kolektör güzergah polyline ----
  (princ "\n\n[3/3] Kolektör güzergah polyline'ini secin")
  (princ "\n      (oda içinden baslayip kollektöre uzanan PLINE):")
  (setq route-sel (entsel))
  (if (not route-sel) (progn (princ "\nIptal.") (exit)))
  (setq route-ent (car route-sel))

  (if (not (equal (cdr (assoc 0 (entget route-ent))) "LWPOLYLINE"))
    (progn
      (princ "\nHATA: Güzergah da LWPOLYLINE olmali!")
      (princ "\n(PLINE ile cizilmis bir hat secin)")
      (exit)))

  (setq route-pts (ufh:get-verts route-ent))
  (if (< (length route-pts) 2)
    (progn (princ "\nGüzergah polyline'i en az 2 nokta icermeli!") (exit)))
  (princ (strcat " -> " (itoa (length route-pts)) " nokta."))

  ;; ---- CIZIM ----
  (princ "\n\nBoru deseni ciziliyor...")

  ;; 1) Oda içi serpantin
  (setq n-rows (ufh:draw-serpantin verts spacing-cm))

  ;; 2) Güzergah gidiş/dönüş borular
  (ufh:draw-route route-pts n-circuits)

  ;; ---- SONUÇ ----
  (princ "\n\n=== UFH-BORU TAMAMLANDI ===")
  (princ (strcat "\n  Adim             : " (rtos spacing-mm 2 0) " mm  ("
                 (rtos spacing-cm 2 1) " cm)"))
  (princ (strcat "\n  Devre sayisi     : " (itoa n-circuits)))
  (princ (strcat "\n  Güzergah borusu  : " (itoa (* 2 n-circuits))
                 " adet  (10 cm aralikli)"))
  (princ (strcat "\n  Oda boru satirlari: " (itoa n-rows)))
  (princ "\n")
  (princ "\n  Katmanlar:")
  (princ "\n    UFH-BORU  (kirmizi ACI-1)  – oda içi ana borular")
  (princ "\n    UFH-DONUS (cyan    ACI-4)  – serpantin donus baglantilar")
  (princ "\n    UFH-GIDIS (mavi    ACI-5)  – guzergah gidis/donus borular")
  (princ "\n\nNOT: Güzergah borularinin hangileri gidis hangisi")
  (princ "\n     donus oldugunu LAYER komutuyla renk/isim ayirarak")
  (princ "\n     veya icerik farkli katmanlara tasiarak belirleyebilirsiniz.")
  (princ))


;; ---------------------------------------------------------------
;; KOMUT: UFH-BORU-MANUEL
;;   Etiket secimine gerek kalmadan hizli test / farkli adim
;; ---------------------------------------------------------------
(defun c:UFH-BORU-MANUEL (/ spacing-mm spacing-cm n-circuits
                             poly-sel poly-ent verts
                             route-sel route-ent route-pts n-rows)
  (vl-load-com)
  (defun mk-lay (nm col)
    (if (not (tblsearch "LAYER" nm))
      (entmake (list '(0 . "LAYER") (cons 2 nm) '(70 . 0)
                     (cons 62 col) (cons 6 "CONTINUOUS")))))
  (mk-lay "UFH-BORU"  1)
  (mk-lay "UFH-DONUS" 4)
  (mk-lay "UFH-GIDIS" 5)

  (setq spacing-mm (getreal "\nBoru adimi (mm) <100>: "))
  (if (not spacing-mm) (setq spacing-mm 100.0))
  (setq n-circuits (getint "\nDevre sayisi <1>: "))
  (if (not n-circuits) (setq n-circuits 1))
  (setq spacing-cm (/ spacing-mm 10.0))

  (princ "\nOda sinir polyline'ini secin: ")
  (setq poly-sel (entsel))
  (if (not poly-sel) (progn (princ "\nIptal.") (exit)))
  (setq poly-ent (car poly-sel))
  (if (not (equal (cdr (assoc 0 (entget poly-ent))) "LWPOLYLINE"))
    (progn (princ "\nLWPOLYLINE degil!") (exit)))
  (setq verts (ufh:get-verts poly-ent))

  (princ "\nKolektör güzergah polyline'ini secin: ")
  (setq route-sel (entsel))
  (if (not route-sel) (progn (princ "\nIptal.") (exit)))
  (setq route-ent (car route-sel))
  (setq route-pts (ufh:get-verts route-ent))

  (setq n-rows (ufh:draw-serpantin verts spacing-cm))
  (ufh:draw-route route-pts n-circuits)

  (princ (strcat "\nTamamlandi. Adim: " (rtos spacing-mm 2 0)
                 " mm | Satirlar: " (itoa n-rows)
                 " | Güzergah: " (itoa (* 2 n-circuits)) " boru"))
  (princ))
