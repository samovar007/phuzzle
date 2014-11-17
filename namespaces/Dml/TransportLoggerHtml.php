<?php
namespace Dml;
/**
 * Транспорт для записи в html на стандартный вывод
 * @author vsamoylov
 */
class TransportLoggerHtml extends TransportLoggerAbstract {
	
	static public function getStyles() {
		return '.dml_html_logger {color: #ccc; background: #333; transparent .3; padding: .5em; margin: 0; }'
			. ' .dml_html_logger.error {color: #f55;'
			;	
	}

	public function write($_str) {
		echo '<pre class="dml_html_logger">' . htmlspecialchars($_str) . '</pre>';
	}
	public function error($_str) {
		echo '<pre class="dml_html_logger error">' . htmlspecialchars($_str) . '</pre>';
	}
}

