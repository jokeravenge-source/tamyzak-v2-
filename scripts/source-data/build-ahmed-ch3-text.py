"""Build text flashcards, retaining native typesetting only for working/equations.

No page images, screenshots, image links or embedded PDF are used by this deck.
"""
import collections
import hashlib
import json
import re
import runpy
from pathlib import Path

HERE=Path(__file__).resolve().parent
M=runpy.run_path(str(HERE/'extract-ahmed-ch3-text.py'))
WORK=M['WORK']; DOC=M['DOC']; NODES=M['NODES']
SOURCE=json.loads((WORK/'deck/cards.json').read_text())
DRAFT=json.loads((WORK/'text-draft.json').read_text())

def canon(t):return re.sub(r'[^a-z0-9]','',M['norm'](t).lower())

def rows(nodes):
    out=[]
    for n in sorted(nodes,key=lambda x:(x['base'],x['x'])):
        row=next((r for r in out if abs(r['base']-n['base'])<2),None)
        if row is None:row={'base':n['base'],'ns':[]};out.append(row)
        row['ns'].append(n)
    return sorted(out,key=lambda r:r['base'])

def native_block(ns,pn):
    x=min(n['x'] for n in ns);y=min(n['y'] for n in ns)
    r=max(n['r'] for n in ns);b=max(n['b'] for n in ns)
    # Native text runs keep exponents, fractions, roots and table alignment.
    runs=[]
    for row in rows(ns):
        for n in sorted(row['ns'],key=lambda n:n['x']):
            last=runs[-1] if runs else None
            if last and abs(last['y']-(n['base']-y))<.2 and abs(last['s']-n['size'])<.2 and abs(last['end']-n['x'])<1:
                last['t']+=n['t'];last['end']=n['r'];last['w']=round(n['r']-x-last['x'],2);continue
            runs.append({'t':n['t'],'x':round(n['x']-x,2),'y':round(n['base']-y,2),'s':round(n['size'],2),'end':n['r'],'w':round(n['r']-n['x'],2)})
    for run in runs:run.pop('end')
    rules=[]
    for d in DOC[pn-1].get_drawings():
        rr=d['rect'];color=d.get('fill') if d['type']=='f' else d.get('color')
        if not color or min(color)>.8:continue
        if 3<rr.width<230 and rr.height<1.7 and x-2<=rr.x0 and rr.x1<=r+2 and y<=rr.y0<=b:
            # Exclude decorative table borders, retain fraction and root bars.
            if any(n.get('font')=='CambriaMath' and abs(n['x']-rr.x0)<rr.width+2 and abs(n['base']-rr.y0)<20 for n in ns):
                rules.append([round(rr.x0-x,2),round(rr.y0-y,2),round(rr.width,2)])
    return {'type':'math','width':round(r-x+3,2),'height':round(b-y+4,2),'runs':runs,'rules':rules}

def content_for(regions,question_regions,q):
    blocks=[]
    for region in regions:
        pn=region['page'];x,y,r,b=region['box']
        ns=[dict(n) for n in NODES[pn] if x<=(n['x']+n['r'])/2<=r and y<=(n['y']+n['b'])/2<=b]
        # The front is removed from the back, never the solution underneath it.
        for qr in question_regions:
            if qr['page']!=pn:continue
            qx,qy,qright,qbottom=qr['box']
            inside=[n for n in ns if qx<=(n['x']+n['r'])/2<=qright and qy<=(n['y']+n['b'])/2<=qbottom]
            whites=[n for n in inside if n['white']]
            if whites and len(whites)>len(inside)*.25:
                remove={id(n) for n in whites}
            else:
                # Source headings sometimes share the crop with a definition.
                target=canon(q);prefix='';remove=set()
                for row in rows(inside):
                    txt=M['plain'](row['ns'],False)
                    candidate=prefix+canon(txt)
                    if len(candidate)>len(target)*1.12+12:break
                    remove.update(id(n) for n in row['ns']);prefix=candidate
                    if len(prefix)>=len(target)*.95:break
            ns=[n for n in ns if id(n) not in remove]
        rs=rows(ns)
        # Mark prose lines, then retain contiguous equation/table rows together.
        classified=[]
        for row in rs:
            text=M['plain'](row['ns'],False)
            words=re.findall(r'[A-Za-z]{3,}',text)
            math=bool(re.search(r'[=⇒⇌→√∛×⁺⁻]',text)) or len(words)<3
            classified.append((row,math,text))
        pending=[]
        def flush_math():
            nonlocal pending
            if pending:blocks.append(native_block(pending,pn));pending=[]
        for i,(row,math,text) in enumerate(classified):
            # Labels of a multi-column working table remain with that table.
            if len(re.findall(r'\|',text))>=1:math=True
            if math:
                if pending and row['base']-max(n['base'] for n in pending)>35:flush_math()
                pending.extend(row['ns'])
            else:
                flush_math()
                if blocks and blocks[-1]['type']=='text' and not re.match(r'^(?:\d[. -]|[A-Z]-|First|Second|Discussion|Note)',text):
                    blocks[-1]['text']+=' '+text
                else:blocks.append({'type':'text','text':text})
        flush_math()
    # Drop an exact repeated heading on note cards.
    if blocks and blocks[0]['type']=='text' and canon(blocks[0]['text'])==canon(q):blocks.pop(0)
    return blocks

MANUAL={
 'AN-CH3-EN-053':('PH',
 'كلما تقل قيمة PH تزداد الحامضية (التناسب عكسي).\nوكلما تزداد قيمة PH تزداد القاعدية (التناسب طردي).\nيستخدم مقياس PH للتعرف على حامضية أو قاعدية المحلول وذلك للتخلص من صعوبة التعامل مع التراكيز المولارية الصغيرة جداً لأيونات H⁺ و OH⁻.\nPH: يسمى دالة الحامضية أو الأس الهيدروجيني.\nPOH: يسمى دالة القاعدية أو الأس الهيدروكسيلي أو الهيدروكسيلي.\nسلم PH يتراوح بين الصفر (0) و(14) ولكن يمكن الحصول على PH سالبة في حالة التراكيز العالية للحوامض القوية ويمكن الحصول على PH > 14 في حالة التراكيز العالية للقواعد القوية.'),
 'AN-CH3-EN-073':('التخفيف',
 'إن إضافة حجم معين من الماء إلى حجم معين من محلول أو بالعكس سيؤدي إلى تغير في تركيز تلك المادة ولغرض إيجاد تركيز هذه المواد بعد الإضافة أو بعد إجراء التخفيف يمكن تطبيق قانون التخفيف.\nM₁ × V₁ = M₂ × V₂\nM₁: التركيز المولاري الأولي للمحلول قبل الإضافة أي قبل التخفيف.\nM₂: التركيز المولاري الثاني للمحلول بعد الإضافة بعد التخفيف.\nV₁: حجم المحلول قبل الإضافة أي قبل التخفيف.\nV₂: حجم المحلول بعد التخفيف، حجم المضاف والمضاف إليه، ماء + محلول.\nΔPH = PH₂ − PH₁\nPH₁: قيمة PH قبل الإضافة وتمثل بعد إذابة المادة إلى ماء فقط، فإذا كان ماء مقطر PH₁ = 7. أما إذا كان حامض أو قاعدة نجد PH₁ من المعطيات.\nPH₂: قيمة PH بعد الإضافة، دائماً نجدها من M₂ ثم PH₂.'),
 'AN-CH3-EN-077':('ملاحظات',
 'عند تخفيف الحامض يقل التركيز، لذا تقل الحامضية.\nعند التخفيف تزداد PH للمحلول لذلك ستكون ΔPH موجبة.\nعندما نضيف ماء إلى حامض ستكون ΔPH قيمة موجبة.\nأما إذا أضفنا الحامض إلى الماء ستزداد حامضية الماء وتقل PH وبذلك ستكون ΔPH سالبة.\nهناك علاقة عكسية بين [H⁺] و PH، فإذا زادت [H⁺] تقل PH وبالعكس.'),
 'AN-CH3-EN-078':('When we add the water to the Base, ΔPH will be negative',
 'When we add the water to a base, the basicity will decrease, then [OH⁻] decrease and PH also decrease so ΔPH = −\n\nWhen we add the Base to the water, ΔPH will be positive:\nWhen we add a base to the water basicity will increase, then [OH⁻] increase and PH also increase so ΔPH = +\n\nWhen we add the water to the acid, ΔPH will be positive:\nWhen we add water to an acid, the acidity will decrease, then [H⁺] decrease and PH increase so ΔPH = +\n\nWhen we add the acid to the water, ΔPH will be negative:\nWhen we add an acid to the water, the water acidity will increase, then [H⁺] increase and PH decrease so ΔPH = −\n\nDirectly proportional: PH, [OH⁻]\nInversely proportional: PH, [H⁺]; [H⁺], [OH⁻]'),
 'AN-CH3-EN-142':('No matter the concentration of Neutral salt, its PH = 7',
 'يمكن معرفة الملح المتعادل من خلال السؤال وذلك بعدم إعطاء ثابت تفكك الحامض أو القاعدة المشتق منهما الملح وذلك لأن ثابت تفكك الحامض القوي أو القاعدة القوية قيمة غير معرفة.'),
 'AN-CH3-EN-268':('مخطط لافكار اللوكات Log اللي ممكن تعطى بالسؤال',
 'اول شي خل نتفق على انه اللوكات ممكن تعطى بالسؤال بطريقة مباشرة و ممكن بطريقة غير مباشرة و حسب هل مخطط حنعرف افكار اللوكات اللي ممكن تعطى بالسؤال\nالمثال اللي حنعتمد عليه بهذا المخطط هو log(16/12)\n\n1- ممكن ينطي اللوكات مباشرة:\nيعني ينطي log 16 و كذلك log 12 مباشرة.\n\n2- ممكن ينطي اللوكات بطرق غير مباشرة:\nممكن ينطي لوك ناتج عملية القسمة يعني هنا ناتج قسمة 16/12 تساوي 1.3 يعني ممكن ينطي log 1.3.\nممكن ينطي اللوكات بعد الاختصار (اذا جان اكو اختصار بالكسر) يعني log(16/12) بعد الاختصار حيصير log(4/3) فراح ينطي log 4 و log 3.\n\nلازم تلتزمون بقيمة اللوكات المعطاة بالسؤال يعني حتى اذا انطاكم قيمة لوك تختلف عن القيمة اللي انتوا حافظيها و متأكدين منها فـ هم لازم تستخدمون قيمة اللوك المعطى بالسؤال فقططط'),
 'AN-CH3-EN-269':('المادة الثالثة (تحديد المادة المضافة) بموضوع البفر',
 'احنا متفقين على ان المادة الثالثة المضافة (سواء جانت حامض قوي اوو قاعدة قوية) لازم تكون قيمتها اللي راح تتعوض بقوانين بفر فقط تركيز مولاري M.\nبس ممكن تعطى بالسؤال باكثررر من شكل و بالاخير لازم مثل متفقنا لازم تتحول الى تركيز مولاري (و اكيد اذا اكو حجمين بالسؤال فلازم نسوي عملية تخفيف).\n\nالمادة المضافة:\nممكن مباشرة تعطى M تركيز مولاري مثل سؤال صفحة 76.\nممكن ينطي مولات فنحولهاا تركيز مولاري عن طريق القانون M = n/V(L) مثل سؤال اللي موجود صفحة 79.\nممكن ينطي كتلة و هم اكيد لازم تتحول تركيز مولاري باستخدام القانون السريع m = M × M × V(L) مثل سؤال اللي موجود صفحة 77.\nممكن اصلاً هو يطلب تركيز اوو عدد مولات او كتلة المادة المضافة مثل سؤال اللي موجود صفحة 79.'),
 'AN-CH3-EN-227':('What should be the [NH₄⁺]/[NH₃] ratio in order to prepare a buffer solution with pH = 9.0 by mixing NH₃ and NH₄Cl? pKb = 4.74, Log⁻¹0.26 = 1.82', None),
 'AN-CH3-EN-234':('What should be the [NH₄⁺]/[NH₃] ratio in order to prepare a buffer solution with pH = 9.0 by mixing NH₃ and NH₄Cl? Note that Kb(NH₃) ≈ 2 × 10⁻⁵ (Log2=0.3)', None),
 'AN-CH3-EN-272':('A liter of NH₃ solution with PH = 11 and degree of ionization = 10⁻² and a liter of NH₄Cl with POH = 9. Find out the amount of change in PH after adding 0.02 mole of HCl to the mixture resulting from mixing the two previous solutions, knowing that log 2 = 0.3 and log 3 = 0.5', None),
 'AN-CH3-EN-278':('Calculate change in PH after adding 0.01M from sulfuric acid H₂SO₄ to 1 liter of buffer solution contains acetic acid CH₃COOH and Sodium acetate CH₃COONa its concentration 0.1M knowing Ka(CH₃COOH) = 1.8 × 10⁻⁵, Log 2 = 0.3, Log 3 = 0.477, Log 1.8 = 0.26',
 'Before addition (common Ion):\nCH₃COOH ⇌ CH₃COO⁻ + H⁺\nCH₃COONa → CH₃COO⁻ + Na⁺\nCommon ion\nPKa = −log Ka\nPKa = −Log 1.8 × 10⁻⁵\nPKa = 5 − 0.26 = 4.74\nPH₁ = PKa + Log([salt]/[acid])\nPH₁ = 4.74 + Log(0.1/0.1)\nPH₁ = 4.74\n\nChange in concentrations:\nH₂SO₄ → 2H⁺ + SO₄²⁻\n0.01 → 2 × 0.01 = 0.02 M\n[H⁺] = 0.02 M\n\nAfter addition (buffer solution):\nPH₂ = PKa + Log(([salt] − [H⁺])/([acid] + [H⁺]))\nPH₂ = 4.74 + Log((0.1 − 0.02)/(0.1 + 0.02))\nPH₂ = 4.74 + Log(0.08/0.12)\nPH₂ = 4.74 + Log 2 − Log 3\nPH₂ = 4.74 + 0.3 − 0.477\nPH₂ = 4.563\n\nΔPH and discussion:\nΔPH = PH₂ − PH₁\nΔPH = 4.563 − 4.74\nΔPH = −0.177\nWe notice that the change in PH is less than 1, and this degree with Buffer solution that resist the change in PH when adding low concentration of strong acid and strong base to it.'),
 'AN-CH3-EN-327':('0.01 mole of PbSO₄ has been added to a liter of distilled water leading thus to compose an aqueous PbSO₄ saturated solution with Ksp = 1 × 10⁻⁸. Find out the number of PbSO₄ moles remaining not soluted',
 'نستخرج قابلية ذوبان PbSO₄ من خلال معرفة Ksp خلال معرفة عدد المولات الذائبة\nPbSO₄(s) ⇌ Pb²⁺(aq) + SO₄²⁻(aq)\nKsp = S² ⇒ 10⁻⁸ = S² ⇒ S = 10⁻⁴ M\nإن قابلية الذوبان تمثل عدد مولات PbSO₄ الذائبة\nn (insoluble) = n (added) − n (dissolved)\nn (insoluble) = 0.0100 − 0.0001 ⇒ n (insoluble) = 0.0099 mole'),
 'AN-CH3-EN-330':('The solubility of Slightly soluble substances increase with temperature',
 'Practically the solubility of slightly soluble substances increases with temperature. But this increase changes from substance to substance.'),
 'AN-CH3-EN-333':('Homework / Explain / By adding KIO₃ to a slightly soluble substance Ba(IO₃)₂, we notice decrease of the solubility and increase of precipitate',
 'We notice that solubility of Ba(IO₃)₂ has decreased because of the formation of the common ion which increased the reverse interaction rate decreasing thus the solubility and increasing precipitate.'),
 'AN-CH3-EN-439':('3-1 In the following equation, equilibrium state is shown between molecules and ions of water. 2H₂O(l) ⇌ H₃O⁺(aq) + OH⁻(aq)\nA. Does the equation change with temperature change?\nB. What is the value of solubility constant of water at 25°C? What are the concentrations of hydrogen and hydroxide ions in pure water?',
 'أ- نعم يتأثر اتزان النظام عند تغير درجة الحرارة.\nب- في الماء النقي فإن:\ny = [OH⁻] = [H⁺]\nKw = [H⁺] × [OH⁻]\n1 × 10⁻¹⁴ = y² ⇒ y = 10⁻⁷ M\n∴ [H⁺] = [OH⁻] = 10⁻⁷ M'),
 'AN-CH3-EN-440':('3-3 / Say if the following substances are acidic, basic or neutral, and why?\nA. NH₄Cl B. Na₂SO₄ C. CH₃COOK D. CaF₂ E. MgSO₄ F. KCl',
 'أ) NH₄Cl ملح حامضي لأنه ملح مشتق من حامض قوي وقاعدة ضعيفة.\nب) Na₂SO₄ ملح متعادل لأنه ملح مشتق من حامض قوي وقاعدة قوية.\nج) CH₃COOK ملح قاعدي لأنه ملح مشتق من قاعدة قوية وحامض ضعيف.\nد) CaF₂ ملح قاعدي لأنه ملح مشتق من قاعدة قوية وحامض ضعيف.\nهـ) MgSO₄ ملح متعادل لأنه ملح مشتق من حامض قوي وقاعدة قوية.\nو) KCl ملح متعادل لأنه ملح مشتق من حامض قوي وقاعدة قوية.'),
 'AN-CH3-EN-441':('1. Find number of mg of barium iodide, BaI₂, dissolved in 150 mL of distilled water. (Ksp = 1.57 × 10⁻⁹ and M = 487 g/mole)\nA. 34.4 mg B. 44.4 mg C. 53.4 mg',
 'Ba(IO₃)₂ ⇌ Ba²⁺ + 2IO₃⁻\ns; 2s\nKsp = [Ba²⁺][IO₃⁻]²\n4s³ = 1.57 × 10⁻⁹\ns³ = (1.57/4) × 10⁻⁹\ns³ = 0.3925 × 10⁻⁹\n∴ s = 0.73 × 10⁻³ M\nM = n/V(L) ⇒ 73 × 10⁻⁵ = n/(150/1000)\nn = 73 × 0.15 × 10⁻⁵\nn = 10.95 × 10⁻⁵\nn = m/M ⇒ m = n × M\nm = 10.95 × 10⁻⁵ × 487\nm = 5332.65 × 10⁻⁵\nm = 0.0533265 g\nm = 0.0534 g\nm = 0.0534 × 1000 ⇒ m = 53.4 mg\nالجواب الصحيح هو (ج) 53.4 mg.\n\nSource wording discrepancy: the question prints barium iodide, BaI₂; the supplied working uses Ba(IO₃)₂.'),
 'AN-CH3-EN-443':('3. Find the pH and pOH values of 0.05 M sodium hydroxide solution\nA. pH = 1.3, pOH = 12.7\nB. pH = 7.0, pOH = 7.0\nC. pH = 12.7, pOH = 1.3',
 'NaOH → Na⁺ + OH⁻\n0.05; 0.05; 0.05\nPOH = −log [OH⁻]\nPOH = −log(5 × 10⁻²)\nPOH = 2 − 0.7\n∴ POH = 1.3\nPH = 14 − 1.3\nPH = 12.7, POH = 1.3\nالجواب الصحيح هو (ج).\n\nSource wording discrepancy: an additional printed PH = 12.3 appears beside the working; the source selects answer C, pH = 12.7 and pOH = 1.3.'),
 'AN-CH3-EN-442':('What are the molar concentrations of Na⁺ and SO₄²⁻ ions in aqueous solution of 0.4 M sodium sulfate?',
 'Na₂SO₄ → 2Na⁺ + SO₄²⁻\n0.4 → 0.8 + 0.4\n[Na⁺] = 0.8 M; [SO₄²⁻] = 0.4 M\nالجواب الصحيح هو (ج).'),
 'AN-CH3-EN-444':('Find the pOH value of 0.5 M aqueous solution of ammonium nitrate, NH₄NO₃: (pKb = 4.74)',
 'PH = ½(PKw − PKb − log [salt])\nPH = ½(14 − 4.74 − log 5 × 10⁻¹)\nPH = ½(14 − 4.74 + 1 − 0.7)\nPH = 9.56/2 = 4.78\n∴ POH = 14 − 4.78 ⇒ POH = 9.22\nالجواب الصحيح هو (ب).'),
 'AN-CH3-EN-011':('Table 3-1 Shows most important Strong acids',
 'Sulfuric acid: H₂SO₄ → 2H⁺ + SO₄²⁻\nChromic acid: H₂CrO₄ → 2H⁺ + CrO₄²⁻\nPerchloric acid: HClO₄ → H⁺ + ClO₄⁻\nNitric Acid: HNO₃ → H⁺ + NO₃⁻\nHydrochloric acid: HCl → H⁺ + Cl⁻\nHydrobromic acid: HBr → H⁺ + Br⁻\nHydroiodic acid: HI → H⁺ + I⁻\nH₂O is shown above each arrow.'),
 'AN-CH3-EN-013':('Table 3-2 Shows most important Strong Bases',
 'Potassium hydroxide: KOH → K⁺ + OH⁻\nSodium hydroxide: NaOH → Na⁺ + OH⁻\nRubidium hydroxide: RbOH → Rb⁺ + OH⁻\nCalcium hydroxide: Ca(OH)₂ → Ca²⁺ + 2OH⁻\nBarium hydroxide: Ba(OH)₂ → Ba²⁺ + 2OH⁻\nH₂O is shown above each arrow.'),
 'AN-CH3-EN-040':('Bronsted acid',
 'is the substance which donates proton in order to form its conjugate base it can be neutral molecules : HCl or positive ion : NH₄⁺ or negative ion : H₂PO₄⁻'),
 'AN-CH3-EN-044':('Sulfuric acid',
 'Sulfuric acid is one of strong electrolytes, and when it dissolves in water it produces an acid solution that’s because of release of Hydrogen ion H⁺'),
 'AN-CH3-EN-050':('Chapter three: IONIC EQUILIBRIUM',
 '[H⁺][OH⁻] = 1 × 10⁻¹⁴\nPx = −log[x]\n[x] = 10^(−Px)\npH + pOH = 14\nMONO: [Acid] = [H⁺]; [Base] = [OH⁻]\nDI: [H⁺] = 2 × [Acid]; [OH⁻] = 2 × [Base]\nn = m/M\nM = n/V(L)\nm = M × M × V(L)\nlog 1 = 0; log 2 = 0.3; log 3 = 0.47 (0.5); log 4 = 0.6; log 5 = 0.7; log 6 = 0.77 (0.8); log 7 = 0.84; log 8 = 0.9; log 9 = 0.95; log 10 = 1'),
 'AN-CH3-EN-093':('the equilibrium constant values of weak acids are accepted as a measurement of their strength.',
 'As the acidity constant of an acid increases (amount of ionization increases), acidity strength increases.'),
 'AN-CH3-EN-261':('B- Buffer solution of weak base and its salt',
 'Pre-addition:\npOH = pKb + log([salt]/[base])\n\nPost-addition:\nA- When adding strong base with low concentration to the solution:\npOH = pKb + log(([salt] − [OH⁻] Strong base)/([base] + [OH⁻] Strong base))\n\nB- When adding strong acid with low concentration to the solution:\npOH = pKb + log(([salt] + [H⁺] Strong acid)/([base] − [H⁺] Strong acid))'),
 'AN-CH3-EN-446':('Slightly soluble compounds in water',
 'Silver chloride: AgCl ⇌ Ag⁺ + Cl⁻\nLead sulfate: PbSO₄ ⇌ Pb²⁺ + SO₄²⁻\nBarium sulfate: BaSO₄ ⇌ Ba²⁺ + SO₄²⁻\nBarium chromate: BaCrO₄ ⇌ Ba²⁺ + CrO₄²⁻\nCalcium oxalate: CaC₂O₄ ⇌ Ca²⁺ + C₂O₄²⁻\nSilver chromate: Ag₂CrO₄ ⇌ 2Ag⁺ + CrO₄²⁻\nZinc hydroxide: Zn(OH)₂ ⇌ Zn²⁺ + 2OH⁻\nBarium iodate: Ba(IO₃)₂ ⇌ Ba²⁺ + 2IO₃⁻\nMagnesium fluoride: MgF₂ ⇌ Mg²⁺ + 2F⁻\nSilver sulfate: Ag₂SO₄ ⇌ 2Ag⁺ + SO₄²⁻\nMagnesium hydroxide: Mg(OH)₂ ⇌ Mg²⁺ + 2OH⁻\nIron (III) hydroxide: Fe(OH)₃ ⇌ Fe³⁺ + 3OH⁻'),
}

if __name__=='__main__':
    # Redundant diagrams/Arabic-only annotations are covered by the source text
    # cards; unworked exercises are retained separately, with no invented answer.
    redundant={'AN-CH3-EN-075'}
    unworked={'AN-CH3-EN-143','AN-CH3-EN-146','AN-CH3-EN-156','AN-CH3-EN-158','AN-CH3-EN-164'}
    cards=[];pending=[]
    for source,draft in zip(SOURCE,DRAFT):
        if source['id'] in redundant:continue
        if source['id'] in unworked:
            pending.append({'id':source['id'],'q':draft['q'],'pages':source['pages'],'reason':'The source gives this exercise without a worked answer.'});continue
        q=draft['q'].replace('^(.)','.').replace('^(,) ', ', ')
        # Prefer the original source heading if a loose region includes the answer.
        if len(canon(q))>len(canon(source['q']))*1.4+20:q=M['norm'](source['q'])
        media=source['sourceMedia']
        if source['id']=='AN-CH3-EN-272':
            media['question'][0]['box'][3]=153
        blocks=content_for(media['answer'],media['question'],q)
        a=draft['a'] or source['a']
        if source['id'] in MANUAL:
            q,manual_answer=MANUAL[source['id']]
            if manual_answer is not None:a=manual_answer;blocks=[{'type':'text','text':a}]
        if source is SOURCE[-1]:
            q,a=MANUAL['AN-CH3-EN-446'];blocks=[{'type':'text','text':a}]
        # Source statements can themselves serve as the full answer, rather than
        # deleting them when the heading and body share identical wording.
        if not blocks or not any((b.get('text','') or b.get('runs')) for b in blocks):
            if not draft['a']:
                pending.append({'id':source['id'],'q':q,'pages':source['pages'],'reason':'Needs manual transcription of source annotation.'});continue
        cards.append({k:source[k] for k in ('id','topic','kind','pages')}|{'q':q,'a':a,'answerBlocks':blocks})
    target=HERE.parents[1]/'src/data'
    target.mkdir(exist_ok=True,parents=True)
    (target/'flashcardsChemCh3AhmedNadawiEn.text.json').write_text(json.dumps(cards,ensure_ascii=False,separators=(',',':')))
    (target/'flashcardsChemCh3AhmedNadawiEn.topics.json').write_text((WORK/'deck/topics.json').read_text())
    (target/'flashcardsChemCh3AhmedNadawiEn.info.json').write_text(json.dumps({'cardCount':len(cards),'topicCount':12}))
    (WORK/'unworked-text-exercises.json').write_text(json.dumps(pending,ensure_ascii=False,indent=2))
    print({'text_cards':len(cards),'pending_exercises':len(pending),'native_math_blocks':sum(b['type']=='math' for c in cards for b in c['answerBlocks'])})
