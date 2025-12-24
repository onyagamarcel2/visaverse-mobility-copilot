from scripts.generate_ts_contracts import OUTPUT_PATH, generate_ts


def test_generated_contracts_are_up_to_date():
    assert OUTPUT_PATH.exists(), "Contracts file missing. Run generate_ts_contracts.py."
    current = OUTPUT_PATH.read_text(encoding="utf-8")
    expected = generate_ts()
    assert (
        current == expected
    ), "TypeScript contracts are outdated. Run `python backend/scripts/generate_ts_contracts.py`."
