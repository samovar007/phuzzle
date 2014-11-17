<?php
namespace Dml;
/**
 * НЕ УВЕРЕН, что надо пользоваться
 * формирует строку в теге.
 * Использование:
 *		$str = \Dml\Tag::construct('p')->class('myclass')->id('idElem')->someOtherAttr('someOtherValue')->html('stringInTag');
 * @author vsamoylov
 */
class Tag {
	/**
	 * Замена конструктору, чтоб можно было делать цепочку
	 * @param string $_tag
	 * @return \Dml\Tag
	 */
	static public function construct($_tag, array $_attr=array()) {
		return new Tag($_tag, $_attr);
	}
	
	private $tag;
	private $attr = array();
	function __construct($_tag, array $_attr=array()) {
		$this->tag = $_tag;
		$this->attr = $_attr;
	}
	function setAttr($_name, $_val) {
		$this->attr[$_name] = $_val;
		return $this;
	}
	function html($_str) {
		if (!sizeof($this->attr)) {
			$attrStr = '';
		} else {
			$attrStr = ' ' 
				. implode(' '
					, array_map(function($_key, $_val){
							return $_key . '="' . addslashes($_val) . '"';
						}
						, array_keys($this->attr), $this->attr
					)
				);
		}
		return '<' . $this->tag . $attrStr . '>' . $_str . '</' . $this->tag . '>';
	}
	/**
	 * Магический метод
	 * @param string $_name название метода
	 * @param array $_args
	 */
	public function __call($_name, array $_args) {
		$this->attr[$_name] = $_args[0];
		return $this;
	}
}

