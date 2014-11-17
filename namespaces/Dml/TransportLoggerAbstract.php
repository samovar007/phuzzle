<?php
namespace Dml;
/**
 * Транспорт для логеров (фейковый)
 * @author vsamoylov
 */
abstract class TransportLoggerAbstract {
	abstract public function write($_str);
	public function error($_str) {
		return $this->write($_str);
	}
}

