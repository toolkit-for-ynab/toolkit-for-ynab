import os
import codecs
import xml.dom.minidom
from kango import logger
from kango.builders import ExtensionBuilderBase
from kango.utils import zip as zip_file, replace_file_content
from kango.settings import KEYWORDS


class ExtensionBuilder(ExtensionBuilderBase):
    key = 'firefox'
    package_extension = '.xpi'
    has_native_require = True

    _info = None
    _kango_path = None
    _transform_table = {
        'em:id': 'id',
        'em:name': 'name',
        'em:description': 'description',
        'em:version': 'version',
        'em:creator': 'creator',
        'em:homepageURL': 'homepage_url',
        'em:updateURL': 'update_url'
    }

    def __init__(self, info, kango_path):
        self._info = info
        self._kango_path = kango_path

    def _add_localization(self, locales, description):
        special_keys = ('__info_name__', '__info_description__')
        tags = ('em:name', 'em:description')
        for name, locale in locales:
            if any(key in special_keys for key in locale):
                xml_body = """
                    <RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#">
                        <em:localized>
                            <Description>
                                <em:locale>Locale</em:locale>
                                <em:name>Name</em:name>
                                <em:description>Description</em:description>
                            </Description>
                        </em:localized>
                    </RDF>
                    """
                locale_doc = xml.dom.minidom.parseString(xml_body)
                localized_elem = locale_doc.getElementsByTagName('em:localized')[0]
                localize_description_elem = localized_elem.getElementsByTagName('Description')[0]
                localize_description_elem.getElementsByTagName('em:locale')[0].childNodes[0].data = name

                for key, tag_name in zip(special_keys, tags):
                    elem = localize_description_elem.getElementsByTagName(tag_name)[0]
                    if key in locale:
                        elem.childNodes[0].data = locale[key]
                    else:
                        localize_description_elem.removeChild(elem)

                description.appendChild(localized_elem)

    def _patch_install_manifest(self, manifest_path, locales):
        doc = xml.dom.minidom.parse(manifest_path)
        rdf = doc.getElementsByTagName('RDF')[0]
        description = rdf.getElementsByTagName('Description')[0]

        for key in self._transform_table:
            elem = description.getElementsByTagName(key)[0]
            info_val = getattr(self._info, self._transform_table[key], '')
            if info_val != '':
                elem.childNodes[0].data = info_val
            else:
                description.removeChild(elem)

        if self._info.options_page is None:
            description.removeChild(description.getElementsByTagName('em:optionsURL')[0])
            description.removeChild(description.getElementsByTagName('em:optionsType')[0])

        self._add_localization(locales, description)

        with codecs.open(manifest_path, 'w', 'utf-8') as f:
            f.write(doc.toxml().replace('chrome://%s' % KEYWORDS['product'], 'chrome://%s' % self._info.package_id))

    def _patch_chrome_manifest(self, path):
        replace_file_content(path, lambda c: c.replace(KEYWORDS['product'], self._info.package_id), 'ascii')

    def build(self, out_path, project_src_path, certificates_path, cmd_args):
        self._info.package_id = '%s-' % KEYWORDS['product'] + self.get_domain_from_id(self._info)
        self._patch_install_manifest(os.path.join(out_path, 'install.rdf'), self.get_locales(self._info.locales, out_path))
        self._patch_chrome_manifest(os.path.join(out_path, 'chrome.manifest'))
        return out_path

    def pack(self, output_path, extension_path, project_src_path, certificates_path, cmd_args):
        name = self.get_full_package_name(self._info)
        outpath = os.path.join(output_path, name)
        zip_file.pack_directory(extension_path, outpath)
        if self._info.update_url.startswith('http://'):
            logger.warning('Firefox requires HTTPS update_path_url with valid certificate')

    def setup_update(self, output_path):
        if self._info.update_url != '' or self._info.update_path_url != '':
            update_xml_filename = 'update_firefox.xml'
            xml_path = os.path.join(self._kango_path, 'src', 'xml', update_xml_filename)

            with codecs.open(xml_path, 'r', 'utf-8') as f:
                content = f.read()

            content = content.format(
                id=self._info.id,
                version=self._info.version,
                update_package_url=self._info.update_path_url + self.get_full_package_name(self._info)
            )

            with codecs.open(os.path.join(output_path, update_xml_filename), 'w', 'utf-8') as f:
                f.write(content)

            self._info.update_url = self._info.update_url if self._info.update_url != '' else self._info.update_path_url + update_xml_filename

    def migrate(self, src_path):
        pass
