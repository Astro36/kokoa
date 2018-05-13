extern crate hangeul;

fn decompose(s: &str) -> Vec<(char, char, char)> {
    let mut components = Vec::new();
    for c in s.chars() {
        components.push((
            hangeul::get_choseong(c).unwrap_or(c),
            hangeul::get_jungseong(c).unwrap_or_default(),
            hangeul::get_jongseong(c)
                .unwrap_or_default()
                .unwrap_or_default(),
        ));
    }
    components
}

pub struct Kokoa {}

impl Kokoa {
    pub fn new() -> Kokoa {
        Kokoa {}
    }

    pub fn train(&self) -> bool {
        true
    }

    pub fn run(&self, document: &str) {
        println!("{}", &document);
        println!("{:?}", decompose(&document))
    }
}

fn main() {
    let sentence = "안녕하세요!";
    let kokoa = Kokoa::new();
    kokoa.run(&sentence);
}
