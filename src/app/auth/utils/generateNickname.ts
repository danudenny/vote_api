function generateNickname(name: string) {
    return name.split(" ").join("").toLowerCase();
}

export default generateNickname;