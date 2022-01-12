class Foo {
  void bar(bool b) {
    if (b) {
      print(b);
    } else
      ;
  }
}

class Bar extends Foo {
  void bar(bool b) {
    return;
  }
}
