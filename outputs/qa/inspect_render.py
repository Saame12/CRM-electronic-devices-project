from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image,ImageOps,ImageDraw
import json
qa=Path(__file__).resolve().parent
pdf=pdfium.PdfDocument(str(qa/'Backline_CRM_layout_check.pdf'))
out=qa/'final-pages';out.mkdir(exist_ok=True)
pages=[]
for i in range(len(pdf)):
 page=pdf[i]
 im=page.render(scale=1.5).to_pil();im.save(out/f'page-{i+1}.png')
 text=page.get_textpage().get_text_range()
 pages.append({'page':i+1,'characters':len(text),'start':text[:100],'end':text[-160:]})
for start in range(0,len(pdf),6):
 sheet=Image.new('RGB',(3*450,2*680),'#D8DEE5');draw=ImageDraw.Draw(sheet)
 for j in range(start,min(start+6,len(pdf))):
  im=Image.open(out/f'page-{j+1}.png');im.thumbnail((430,630))
  x=(j-start)%3*450+10;y=(j-start)//3*680+30
  sheet.paste(im,(x,y));draw.text((x,y-20),f'Page {j+1}',fill='black')
 sheet.save(out/f'overview-{start//6+1}.png')
(qa/'render-page-index.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
print('Pages:',len(pdf))
print(json.dumps(pages,ensure_ascii=True,indent=1))
