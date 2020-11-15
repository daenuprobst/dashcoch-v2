import json
import pandas as pd

def main():
    df = pd.read_csv("https://raw.githubusercontent.com/daenuprobst/covid19-cases-switzerland/master/owid_international.csv", usecols=["location"])
    countries = {v: v for v in df["location"].unique()}
    with open("countries.json", "w+", encoding="utf-8") as f:
        json.dump(countries, f, ensure_ascii=False)


if __name__ == "__main__":
    main()