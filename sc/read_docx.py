import zipfile
import xml.etree.ElementTree as ET
import sys

def docx_to_text(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # Namespace map
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            for p in root.findall('.//w:p', ns):
                texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
                if texts:
                    paragraphs.append(''.join(texts))
            return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error: {e}"

# Write results to utf-8 text files
with open('extracted_questionnaire_new.txt', 'w', encoding='utf-8') as f:
    f.write(docx_to_text('Secure-Steps-Questionnaire.docx'))

with open('extracted_project_doc.txt', 'w', encoding='utf-8') as f:
    f.write(docx_to_text('Secure_Steps_Project_Documentation.docx'))

print("Extracted to text files successfully!")
