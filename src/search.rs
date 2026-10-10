use reqwest::header::USER_AGENT;
use scraper::{Html, Selector};

pub async fn execute_live_search(query: &str) -> Result<String, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let encoded_query = urlencoding::encode(query);
    let url = format!("https://html.duckduckgo.com/html/?q={}", encoded_query);
    
    let res = client.get(&url)
        .header(USER_AGENT, "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0")
        .send()
        .await?
        .text()
        .await?;

    let document = Html::parse_document(&res);
    
    // Try multiple selectors common to DuckDuckGo HTML layout
    let selectors = [
        ".result__snippet",
        ".result__body",
        "a.result__url"
    ];

    let mut results = String::new();
    for sel_str in &selectors {
        if let Ok(selector) = Selector::parse(sel_str) {
            for (i, element) in document.select(&selector).take(3).enumerate() {
                let text = element.text().collect::<Vec<_>>().join(" ");
                let trimmed = text.trim();
                if !trimmed.is_empty() && !results.contains(trimmed) {
                    results.push_str(&format!("[{}] {}\n", i + 1, trimmed));
                }
            }
        }
        if !results.is_empty() {
            break;
        }
    }

    if results.is_empty() {
        Ok(format!("Raw HTML length fetched: {} bytes, but no matching DOM elements parsed.", res.len()))
    } else {
        Ok(results)
    }
}
