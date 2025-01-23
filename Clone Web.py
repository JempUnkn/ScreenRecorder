import requests
from bs4 import BeautifulSoup

url = input("Digite a URL do arquivo que quer baixar: ")
name = input("Digite o nome & a extensao: ")

# Baixa o conteúdo principal
response = requests.get(url)
if response.status_code == 200:
    with open(f"{name}", "wb") as file:
        file.write(response.content)

    # Verifica scripts adicionais
    soup = BeautifulSoup(response.text, "html.parser")
    for script in soup.find_all("script", src=True):
        script_url = script["src"]
        if not script_url.startswith("http"):
            script_url = url.rsplit("/", 1)[0] + "/" + script_url
        script_response = requests.get(script_url)
        if script_response.status_code == 200:
            script_name = script_url.rsplit("/", 1)[-1]
            with open(script_name, "wb") as script_file:
                script_file.write(script_response.content)
            print(f"Baixado: {script_name}")
else:
    print("Falha ao acessar o URL.")
