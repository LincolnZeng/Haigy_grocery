Please do not change any files in "haigy_repository/vendor/ui/semantic/_VERSION_/dist" directly. Please follow below process to modify it.

If anything changed in "haigy_repository/vendor/ui/semantic/_VERSION_/src/themes/haigy/assets/fonts" directory, please update the timestamp of the font file name. Then update all related places that use the font file name. For example, the variable "@fontName" should be updated to the new font file name in the file "icon.variables". The purpose of this timestamp update is to bypass the old Apache server cache.


---------------------------------------------------------------------------


The process to implement "haigy" theme in Semantic UI, and regenerate files in "dist" folder:

1. If Semantic UI is not installed, follow the instruction in the website, http://semantic-ui.com/introduction/getting-started.html, to install Semantic UI (version 2.1.4) in your own machine.

2. Under your Semantic UI installation folder, run "rm -rf src/themes/haigy".

3. Copy all folders and files in the "src" folder to the corresponding place under your Semantic UI installation folder.

4. Under your Semantic UI installation folder, run "gulp clean", and then run "gulp build".

5. Copy new generated Semantic "dist" and replace "haigy_repository/vendor/ui/semantic/_VERSION_/dist"

6. Done!
