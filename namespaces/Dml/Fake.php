<?php
namespace Dml;
/**
 * Идея класса - замена реальных объектов на фейковые
 * Применяется, например, при вызове дебаг-логера
 * У объекта есть любые методы, из каждого он возвращает себя
 * @author vsamoylov
 */
class Fake {
	public function __call($_name, array $_args) {
		return $this;
	}
}

