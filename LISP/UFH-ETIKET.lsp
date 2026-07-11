;;; ================================================================
;;; UFH-ETIKET.lsp  v4.0
;;; Yerden Isitma – Excel → DWG etiket (BLOCK)
;;; ZwCAD 2026
;;; ----------------------------------------------------------------
;;; DEGİSİKLİKLER (v3.2 → v4.0):
;;;   - command "._BLOCK" KALDIRILDI  → entmake ile BLOCK/ENDBLK
;;;   - command "-INSERT"  KALDIRILDI  → entmake ile INSERT
;;;   - MTEXT satir sonu: "\n" → "\\P"   (DXF MTEXT formatı)
;;;   - Varsayilan metin yuksekligi: 0.15 → 20  (cm birim icin)
;;;   - Islem sonunda otomatik ZOOM EXTENTS
;;;   - CMDECHO 0 (komut satiri temiz)
;;; ================================================================

;; ---------------------------------------------------------------
;; TRIM
;; ---------------------------------------------------------------
(defun ufh:trim (s / r cr lf)
  (setq r  (if s s "")
        cr (chr 13)
        lf (chr 10))
  (while (and (> (strlen r) 0)
              (member (substr r 1 1) (list " " "\t" lf cr)))
    (setq r (substr r 2)))
  (while (and (> (strlen r) 0)
              (member (substr r (strlen r) 1) (list " " "\t" lf cr)))
    (setq r (substr r 1 (1- (strlen r)))))
  r)

;; ---------------------------------------------------------------
;; TSV SATIRI AYRISTIR
;; ---------------------------------------------------------------
(defun ufh:parse-tsv (line / result pos start len)
  (setq result '() start 0 len (strlen line))
  (while (< start len)
    (setq pos (vl-string-search "\t" line start))
    (if pos
      (progn
        (setq result (append result
                       (list (substr line (1+ start) (- pos start)))))
        (setq start (1+ pos)))
      (progn
        (setq result (append result
                       (list (substr line (1+ start)))))
        (setq start len))))
  result)

;; ---------------------------------------------------------------
;; GUVENLI SAYI
;; ---------------------------------------------------------------
(defun ufh:num (s)
  (cond ((null s) 0.0) ((= s "") 0.0) (t (atof s))))

;; ---------------------------------------------------------------
;; DWG'DE TUM ESLESEN KOORDINATLARI BUL
;; TEXT + MTEXT + ATTRIB  (wcmatch ile)
;; ---------------------------------------------------------------
(defun ufh:find-all-pts (mn / ss i elist txt tr pts cp)
  (setq pts '())

  ;; --- TEXT ---
  (setq ss (ssget "X" (list (cons 0 "TEXT"))))
  (if ss
    (progn
      (setq i 0)
      (while (< i (sslength ss))
        (setq elist (entget (ssname ss i))
              txt   (cdr (assoc 1 elist)))
        (if (and txt
                 (wcmatch (ufh:trim txt) (strcat "*" mn "*")))
          (setq pts (cons (cdr (assoc 10 elist)) pts)))
        (setq i (1+ i)))))

  ;; --- MTEXT ---
  (setq ss (ssget "X" (list (cons 0 "MTEXT"))))
  (if ss
    (progn
      (setq i 0)
      (while (< i (sslength ss))
        (setq elist (entget (ssname ss i))
              txt   (cdr (assoc 1 elist)))
        (if txt
          (progn
            (setq tr (ufh:trim txt))
            ;; MTEXT format kodu varsa soy
            (if (wcmatch tr "{\\*")
              (progn
                (setq cp (vl-string-search ";" tr))
                (if cp (setq tr (substr tr (+ cp 2))))
                (setq tr (ufh:trim (vl-string-trim "}" tr)))))
            (if (wcmatch tr (strcat "*" mn "*"))
              (setq pts (cons (cdr (assoc 10 elist)) pts)))))
        (setq i (1+ i)))))

  ;; --- ATTRIB ---
  (setq ss (ssget "X" (list (cons 0 "ATTRIB"))))
  (if ss
    (progn
      (setq i 0)
      (while (< i (sslength ss))
        (setq elist (entget (ssname ss i))
              txt   (cdr (assoc 1 elist)))
        (if (and txt
                 (wcmatch (ufh:trim txt) (strcat "*" mn "*")))
          (setq pts (cons (cdr (assoc 10 elist)) pts)))
        (setq i (1+ i)))))

  pts)

;; ---------------------------------------------------------------
;; BLOCK TANIMI  –  tamamen entmake ile (command YOK)
;;
;; MTEXT satir sonu: \\P  (DXF MTEXT formatinda \P = yeni satir)
;; Justification 5 = MiddleCenter  →  INSERT noktasi = etiket merkezi
;; ---------------------------------------------------------------
(defun ufh:ensure-block (blkname content h w)
  (if (not (tblsearch "BLOCK" blkname))
    (progn
      ;; BLOCK baslik
      (entmake
        (list '(0 . "BLOCK")
              (cons 2 blkname)
              '(8 . "0")
              '(70 . 0)
              '(10 0.0 0.0 0.0)
              '(210 0.0 0.0 1.0)))
      ;; MTEXT icerigi
      (entmake
        (list '(0 . "MTEXT")
              (cons 8 "UFH-ETIKET")
              '(10 0.0 0.0 0.0)
              '(210 0.0 0.0 1.0)
              (cons 40 h)    ; metin yuksekligi
              (cons 41 w)    ; referans genislik
              '(71 . 5)      ; MiddleCenter hizalama
              '(72 . 1)      ; soldan saga
              (cons 1 content)))
      ;; ENDBLK
      (entmake '((0 . "ENDBLK") (8 . "0")))))
  blkname)

;; ---------------------------------------------------------------
;; BLOCK INSERT  –  entmake ile (command -INSERT YOK)
;; ---------------------------------------------------------------
(defun ufh:insert-blk (blkname pt mn ma adm dv br brd aks / ent)
  (entmake
    (list '(0 . "INSERT")
          (cons 2  blkname)
          '(8 . "UFH-ETIKET")
          (cons 10 (list (car pt) (cadr pt) 0.0))
          '(41 . 1.0)         ; X olcek
          '(42 . 1.0)         ; Y olcek
          '(43 . 1.0)         ; Z olcek
          '(50 . 0.0)         ; donus acisi
          '(70 . 0)           ; kolon sayisi
          '(210 0.0 0.0 1.0)))
  (setq ent (entlast))
  ;; xdata – UFH-BORU icin
  (entmod
    (append (entget ent)
      (list
        (list -3
          (list "HVAC_UFH"
            (cons 1000 mn)
            (cons 1000 ma)
            (cons 1040 (float adm))
            (cons 1040 (float dv))
            (cons 1040 (float br))
            (cons 1040 (float brd))
            (cons 1040 (float aks)))))))
  ent)


;; ================================================================
;; ANA KOMUT: UFH-ETIKET
;; ================================================================
(defun c:UFH-ETIKET (/ *error* oldecho
                       wsh vbs tsv _dbg _dh _dl _ret excel_path
                       fh line rows r
                       mn ma tp kt al kp tg td adm cap krs tdf knt
                       br dv brd aks
                       h w content warn blkname pts pt
                       nf nm ns)

  (defun *error* (msg)
    (setvar "CMDECHO" oldecho)
    (if (not (member msg '("Function cancelled" "quit / exit abort")))
      (princ (strcat "\n[UFH-ETIKET HATA]: " msg)))
    (princ))

  (vl-load-com)
  (setq oldecho (getvar "CMDECHO"))
  (setvar "CMDECHO" 0)

  ;; Katman + uygulama kaydı
  (defun mk-lay (nm col)
    (if (not (tblsearch "LAYER" nm))
      (entmake (list '(0 . "LAYER") (cons 2 nm) '(70 . 0)
                     (cons 62 col) (cons 6 "CONTINUOUS")))))
  (mk-lay "UFH-ETIKET" 30)
  (regapp "HVAC_UFH")

  ;; Dosya yollari
  (setq vbs  "C:\\Users\\gkhns\\AppData\\Local\\Temp\\ufh_xl.vbs")
  (setq tsv  "C:\\Users\\gkhns\\AppData\\Local\\Temp\\ufh_data.tsv")
  (setq _dbg "C:\\Users\\gkhns\\AppData\\Local\\Temp\\ufh_debug.txt")

  ;; Excel sec
  (setq excel_path (getfiled "YERDEN ISITMA Excel" "" "xlsx" 0))
  (if (not excel_path) (progn (setvar "CMDECHO" oldecho) (princ "\nIptal.") (exit)))
  (setq excel_path (vl-string-translate "/" "\\" excel_path))
  (princ (strcat "\nExcel: " (vl-filename-base excel_path)))

  ;; ---------------------------------------------------------------
  ;; VBScript  –  Excel → ASCII TSV
  ;; Sutunlar: 1,2,3,4,5,6,9,10,14,16,18,19,20,21,22,23,24
  ;; ---------------------------------------------------------------
  (setq fh (open vbs "w"))
  (write-line "On Error Resume Next" fh)
  (write-line "Dim xl,wb,ws,fso,f,fd,r,ci,val,rowStr,nRows" fh)
  (write-line "Dim c(16)" fh)
  (write-line "c(0)=1:c(1)=2:c(2)=3:c(3)=4:c(4)=5:c(5)=6" fh)
  (write-line "c(6)=9:c(7)=10:c(8)=14:c(9)=16:c(10)=18:c(11)=19" fh)
  (write-line "c(12)=20:c(13)=21:c(14)=22:c(15)=23:c(16)=24" fh)
  (write-line "Set xl=CreateObject(\"Excel.Application\")" fh)
  (write-line "xl.Visible=False:xl.DisplayAlerts=False" fh)
  (write-line (strcat "Set wb=xl.Workbooks.Open(\"" excel_path "\")") fh)
  (write-line "Set ws=wb.Worksheets(wb.Worksheets.Count)" fh)
  (write-line "Set fso=CreateObject(\"Scripting.FileSystemObject\")" fh)
  (write-line (strcat "Set f=fso.CreateTextFile(\"" tsv "\",True,False)") fh)
  (write-line "nRows=0" fh)
  (write-line "For r=4 To 200" fh)
  (write-line "  val=ws.Cells(r,1).Value" fh)
  (write-line "  If IsEmpty(val) Or IsNull(val) Then Exit For" fh)
  (write-line "  Dim sv:sv=Trim(CStr(val))" fh)
  (write-line "  If sv=\"\" Then Exit For" fh)
  (write-line "  If UCase(sv)=\"TOPLAM\" Then Exit For" fh)
  (write-line "  rowStr=\"\"" fh)
  (write-line "  For ci=0 To 16" fh)
  (write-line "    val=ws.Cells(r,c(ci)).Value" fh)
  (write-line "    If IsEmpty(val) Or IsNull(val) Then" fh)
  (write-line "      val=\"\"" fh)
  (write-line "    ElseIf IsNumeric(val) Then" fh)
  (write-line "      val=CStr(CDbl(val))" fh)
  (write-line "    Else" fh)
  (write-line "      val=CStr(val)" fh)
  (write-line "    End If" fh)
  (write-line "    If ci=0 Then rowStr=val Else rowStr=rowStr & Chr(9) & val" fh)
  (write-line "  Next" fh)
  (write-line "  f.WriteLine rowStr" fh)
  (write-line "  nRows=nRows+1" fh)
  (write-line "Next" fh)
  (write-line "f.Close" fh)
  (write-line (strcat "Set fd=fso.CreateTextFile(\"" _dbg "\",True,False)") fh)
  (write-line "fd.WriteLine \"Satir=\" & nRows" fh)
  (write-line "fd.WriteLine \"Sheet=\" & ws.Name" fh)
  (write-line "fd.Close" fh)
  (write-line "wb.Close False" fh)
  (write-line "xl.Quit" fh)
  (close fh)

  ;; VBScript calistir
  (princ "\nExcel okunuyor...")
  (setq wsh (vlax-get-or-create-object "WScript.Shell"))
  (setq _ret (vlax-invoke-method wsh "Run"
               (strcat "cscript //nologo \"" vbs "\"")
               0 :vlax-true))
  (vlax-release-object wsh)
  (princ (strcat " cikis=" (vl-princ-to-string _ret)))

  ;; VBS debug
  (if (findfile _dbg)
    (progn
      (setq _dh (open _dbg "r"))
      (while (setq _dl (read-line _dh))
        (princ (strcat "  [vbs] " _dl)))
      (close _dh)))

  ;; TSV kontrol
  (if (not (findfile tsv))
    (progn (setvar "CMDECHO" oldecho)
           (princ "\n[HATA] TSV olusturulamadi!") (exit)))

  ;; TSV oku
  (setq rows '() fh (open tsv "r"))
  (while (setq line (read-line fh))
    (setq line (ufh:trim line))
    (if (> (strlen line) 0)
      (setq rows (append rows (list (ufh:parse-tsv line))))))
  (close fh)

  (princ (strcat "\n" (itoa (length rows)) " mahal yuklendi."))
  (if (= (length rows) 0)
    (progn (setvar "CMDECHO" oldecho)
           (princ "\n[HATA] Veri yok!") (exit)))

  ;; -------------------------------------------------------------------
  ;; Metin yuksekligi
  ;; Not: Cizim CM birimindedir. Ornek: 3m x 4m oda = 300 x 400 birim.
  ;; Gorunur etiket icin 15-25 birim onerilir.
  ;; -------------------------------------------------------------------
  (princ "\n")
  (princ "Metin yuksekligi (CM birimi, ornek 20 = 20cm): ")
  (setq h (getdist ""))
  (if (not h) (setq h 20.0))
  (setq w (* h 18.0))  ; 7 satirli etiket icin genislik

  ;; ---------------------------------------------------------------
  ;; ETIKET DONGUSU
  ;; ---------------------------------------------------------------
  (setq nf 0  nm 0  ns 0)

  (foreach r rows
    (setq mn  (ufh:trim (nth 0  r))
          ma  (ufh:trim (nth 1  r))
          tp  (ufh:trim (nth 2  r))
          kt  (ufh:trim (nth 3  r))
          al  (ufh:num  (nth 4  r))
          kp  (ufh:num  (nth 5  r))
          tg  (ufh:num  (nth 6  r))
          td  (ufh:num  (nth 7  r))
          adm (ufh:num  (nth 8  r))
          cap (ufh:num  (nth 9  r))
          krs (ufh:num  (nth 10 r))
          tdf (ufh:num  (nth 11 r))
          knt (ufh:trim (nth 12 r))
          br  (ufh:num  (nth 13 r))
          dv  (ufh:num  (nth 14 r))
          brd (ufh:num  (nth 15 r))
          aks (ufh:num  (nth 16 r)))

    (if (= mn "") (setq mn "?"))

    (setq warn
      (if (vl-string-search "UYARI" (strcase knt))
        (strcat "Tdos=" (rtos tdf 2 1) "C  !!LIMIT")
        (strcat "Tdos=" (rtos tdf 2 1) "C  OK")))

    ;; ONEMLI: MTEXT satir sonu = \P  (LISP stringde "\\P")
    (setq content
      (strcat "[" mn "] " ma "\\P"
              "Kat:" kt "  Tip:" tp "\\P"
              "Alan:" (rtos al 2 1) "m2  Q:" (itoa (fix kp)) "W\\P"
              "Adim:" (itoa (fix adm)) "mm  "
                     (itoa (fix tg)) "/" (itoa (fix td)) "C\\P"
              "Boru:" (rtos br 2 1) "m  Dv:" (itoa (fix dv)) "\\P"
              "B/Dv:" (rtos brd 2 1) "m  " (rtos aks 2 1) "L/h\\P"
              warn))

    ;; Block adi
    (setq blkname (strcat "UFH-" mn))

    ;; Block tanimi olustur (ilk seferinde)
    (ufh:ensure-block blkname content h w)

    ;; DWG'de TUM eslesen noktalari bul
    (setq pts (ufh:find-all-pts mn))

    (if pts
      (progn
        (foreach pt pts
          (ufh:insert-blk blkname pt mn ma adm dv br brd aks)
          (setq nf (1+ nf)))
        (princ (strcat "\n  [" mn "] " (itoa (length pts)) " nokta -> OK")))
      (progn
        (princ (strcat "\n[" mn "] bulunamadi – nokta tikla <Enter=atla>: "))
        (setq pt (getpoint))
        (if pt
          (progn
            (ufh:insert-blk blkname pt mn ma adm dv br brd aks)
            (princ " -> OK")
            (setq nm (1+ nm)))
          (progn
            (princ " -> atlandi")
            (setq ns (1+ ns)))))))

  ;; Sonuclar
  (princ (strcat "\n\n=== TAMAMLANDI ==="))
  (princ (strcat "\n  Otomatik : " (itoa nf) " etiket"))
  (princ (strcat "\n  Manuel   : " (itoa nm) " etiket"))
  (princ (strcat "\n  Atlandi  : " (itoa ns)))

  ;; Tum etiketi gostermek icin ZOOM EXTENTS
  (if (> (+ nf nm) 0)
    (progn
      (princ "\nEtiketler gosteriliyor (ZOOM EXTENTS)...")
      (command "ZOOM" "E")))

  (setvar "CMDECHO" oldecho)
  (princ))

(princ "\n[UFH-ETIKET v4.0 yuklendi]  Komut: UFH-ETIKET")
(princ)
