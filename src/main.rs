extern crate hangeul;
extern crate regex;

use regex::Regex;

fn compose_all(components: &Vec<(char, char, char)>) -> String {
    components
        .into_iter()
        .map(|component| {
            hangeul::compose(component.0, component.1, Some(component.2)).unwrap_or(component.0)
        })
        .collect()
}

fn decompose_all(content: &str) -> Vec<(char, char, char)> {
    content
        .chars()
        .map(|c| {
            (
                hangeul::get_choseong(c).unwrap_or(c),
                hangeul::get_jungseong(c).unwrap_or_default(),
                hangeul::get_jongseong(c)
                    .unwrap_or_default()
                    .unwrap_or_default(),
            )
        })
        .collect()
}

fn split(content: &str) -> Vec<String> {
    let alphabet = Regex::new("^[A-z]+$").unwrap();
    let hangul = Regex::new("^[가-힣]+$").unwrap();
    let number = Regex::new("^[0-9]+$").unwrap();
    let mut chunks = Vec::<String>::new();
    let mut previous_chunk = "".to_string();
    for s in content.chars().map(|c| c.to_string()) {
        if (alphabet.is_match(&previous_chunk) && alphabet.is_match(&s))
            || (hangul.is_match(&previous_chunk) && hangul.is_match(&s))
            || (number.is_match(&previous_chunk) && number.is_match(&s))
            || &previous_chunk == ""
        {
            previous_chunk.push_str(&s);
        } else {
            chunks.push(previous_chunk);
            previous_chunk = "".to_string();
            previous_chunk.push_str(&s);
        }
    }
    chunks.push(previous_chunk);
    chunks
}

pub struct Kokoa {}

impl Kokoa {
    pub fn new() -> Kokoa {
        Kokoa {}
    }

    pub fn train(&self, document: &str) -> bool {
        println!("{}", &document);
        true
    }

    pub fn run(&self, document: &str) {
        println!("{}", &document);
        let d = decompose_all(&document);
        println!("{:?}", &d);
        println!("{}", compose_all(&d));
    }
}

fn main() {
    let sentence = "안녕하세요!";
    let kokoa = Kokoa::new();
    kokoa.run(&sentence);
    println!("{:?}", split("안녕ㅎㅎㅎㅎ12 4rr ?"))
}
