<?php
namespace Dml;
/**
 *
 * @author vsamoylov
 */
class Logger {
	/**
	 * @var TransportLoggerAbstract
	 */
	protected $transport;
	/**
	 * Шаблон для даты, для заголовка строки
	 * @var string
	 */
	protected $lineHeaderTpl = 'H:i:s ';
	/**
	 * Функции для формирования заголовка строки (чтоб поменьше было if)
	 * @var array
	 */
	protected $func = array();
	/**
	 * Конструктор
	 * @return \Dml\ConsoleLogger
	 */
	public function __construct(TransportLoggerAbstract $_transport) {
		$this->func['stdFormLine'] = function($_str, $_lineHeaderTpl) {
			return date($_lineHeaderTpl) . $_str;
		};
		$this->func['emptyFormLine'] = function($_str) {
			return $_str;
		};
		$this->func['formLine'] = $this->func['stdFormLine'];
		$this->transport = $_transport;
	}
	/**
	 * Позволяет установить стандартный или пустой заголовок строки
	 * @param string $_dateFormat - шаблон для вывода даты в начале строки
	 * @param bool $_needWritePid - нужно ли выводить pid в начале строки
	 * @return \Dml\ConsoleLogger
	 */
	function setLineHeaderParams($_dateFormat, $_needWritePid=false) {
		if (empty($_dateFormat)) {
			if (!$_needWritePid) {
				$this->func['formLine'] = $this->func['emptyFormLine'];
			}
		} else {
			$_dateFormat .= ' ';
		}
		if ($_needWritePid) {
			$_dateFormat .= getmypid() . ' ';
		}
		$this->lineHeaderTpl = $_dateFormat;
		$this->func['formLine'] = $this->func['stdFormLine'];
		return $this;
	}
	/**
	 * Устанавливает callback функцию для формирования строки вместо стандартной
	 * @param callback $_function
	 * @return \Dml\ConsoleLogger
	 */
	function setFormLineFunc($_function) {
		$this->func['formLine'] = $_function;
		return $this;
	}
	
	
	/**
	 * Производит запись переданной строки
	 * @param string $_str
	 * @return \Dml\ConsoleLogger
	 */
	protected function internalWrite($_str) {
		$this->transport->write($_str);
		return $this;
	}
	/**
	 * Производит запись строки с заголовком
	 * @param string $_str
	 * @return \Dml\ConsoleLogger
	 */
	function write($_str) {
		return $this->internalWrite($this->func['formLine']($_str, $this->lineHeaderTpl));
	}
	function error($_str, $_fatal=false) {
		return $this->transport->error($this->func['formLine'](($_fatal ? 'FATAL ' : '') . 'ERROR ' . $_str, $this->lineHeaderTpl));
	}
	/**
	 * Пишет название файла и строку места вызова 
	 * @param string $_describe - не обязательное описание места вызова
	 * @param int $_level - не обязательное - уровень в стеке вызовов
	 * @return \Dml\ConsoleLogger
	 */
	function writefl($_describe='', $_level=0) {
		$b = debug_backtrace();
		return $this->write($b[$_level]['file'] . ':' . $b[$_level]['line'] . ' ' . $_describe);
	}
	/**
	 * Дампит переданную переменную и записывает в лог
	 * @param object $_obj - объект для дампа (может быть и скалярной переменной
	 * @param string $_describe - не обязательное описание
	 * @return \Dml\ConsoleLogger
	 */
	function varDump($_obj, $_describe = '') {
		return $this->write('varDump: ' . $_describe . var_export($_obj, true));
	}
	/**
	 * Записывает бектрейс точки вызова в лог в удобочитаемом виде
	 * @param string $_describe - не обязательное описание
	 * @return \Dml\ConsoleLogger
	 */
	function backtrace($_describe = '') {
		$trace = debug_backtrace();
		$str = '';
		foreach ($trace as $r) {
			$str .= "\n" . (isset($r['file']) ? $r['file'] : '-') . ':' . (isset($r['line']) ? $r['line'] : '-');
		}
		return $this->write('backtrace: ' . $_describe . $str);
	}
	/**
	 * ставит разделитель
	 * @param string $_str - не обязательное название разделителя
	 * @return \Dml\ConsoleLogger
	 */
	function border($_str = '') {
		return $this->internalWrite(str_repeat('-', 3) . (empty($_str) ? '' : ( ' ' . $_str . ' ')) . str_repeat('-', 3));
	}
}

