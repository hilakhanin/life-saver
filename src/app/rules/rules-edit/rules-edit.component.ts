import { Component, OnInit, SecurityContext } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { IndexType } from '../../settings/index-types/index-type.model';
import { SettingService } from '../../settings/settings.service';
import { FormulaService } from '../formula.service';
import { Rule } from '../rule.model';
import { DomSanitizer } from '@angular/platform-browser';
import { HelperService } from '../../shared/helper.service';
import { MatDialog } from '@angular/material/dialog';
import { e, evaluate, log, pi, sqrt } from 'mathjs';
import { SharedService } from '../../shared/shared.service';


declare var CKEDITOR: any;
@Component({
  selector: 'app-rules-edit',
  templateUrl: './rules-edit.component.html',
  styleUrls: ['./rules-edit.component.css']
})
export class RulesEditComponent implements OnInit {

  id: number;
  rule: Rule;
  editMode = false;

  ruleForm: FormGroup;
  index_types: IndexType[] = [];

  config: any;
  sanitizedEditor: string;
  hiddenEquationString: string = '';

  constructor(
    private route: ActivatedRoute,
    private formulaService: FormulaService,
    private router: Router,
    private translateService: TranslateService,
    private settingService: SettingService,
    private sharedService: SharedService,
    private sanitizer: DomSanitizer,
    private helperService: HelperService,
    public dialog: MatDialog
  ) {
    this.setupeditor();
  };

  ngOnInit() {
    this.settingService.fetchIndexTypes(true).subscribe(res => {
      this.index_types = res;
    });

    this.translateService.get('app')
      .subscribe();

    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.rule = this.formulaService.getRule(this.id);

      if (this.rule === undefined && this.id > 0) {
        this.router.navigate(['/rules'], { queryParams: { showSnackbar: true, snackbarMessage: this.translateService.instant('app.snackbars.noRule') } });
      }

      this.editMode = params['id'] != null;
      this.initForm();

    });
  }

  //#region setup
  private initForm() {
    this.ruleForm = new FormGroup({
      'id': new FormControl(this.rule ? this.rule.Id : null),
      'name': new FormControl(this.rule ? this.rule.Name : null, Validators.required),
      'isActive': new FormControl(this.rule ? this.rule.IsActive : false),
      'cutoff': new FormControl(this.rule ? this.rule.Cutoff : null, Validators.required),
      'equation': new FormControl(this.rule ? this.rule.Equation : null, Validators.required),
      'position': new FormControl(this.rule ? this.rule.Position : null)
    });
  }

  private setupeditor() {

    const self = this;

    this.config = {
      on: {
        pluginsLoaded: function () {
          const editor = this,
            config = editor.config;

          editor.ui.addRichCombo('indexTypesDropdown', {
            label: 'Index Types',
            title: 'Index Types',
            panel: {
              css: [CKEDITOR.skin.getPath('editor')].concat(config.contentsCss),
              multiSelect: false,
              attributes: { 'aria-label': 'Index Types' }
            },
            init: function () {
              self.index_types.forEach(element => {
                this.add(self.translateService.instant('app.rules.elementId', { name: element.Name }), element.Name)
              });
            },
            onClick: function (value) {
              editor.focus();
              editor.fire('saveSnapshot');
              editor.insertHtml(value);
              editor.fire('saveSnapshot');
            }
          });

          editor.addCommand("insertSquareRoot", {
            exec: function () {
              editor.focus();
              editor.fire('saveSnapshot');
              editor.insertHtml("sqrt()");
              editor.fire('saveSnapshot');
            }
          });
          editor.ui.addButton('InsertSquareRoot', {
            label: "Insert Square Root",
            command: 'insertSquareRoot',
            toolbar: 'insert',
            icon: "sqrt"
          });

          editor.addCommand("insertSigma", {
            exec: function () {
              editor.focus();
              editor.fire('saveSnapshot');
              editor.insertHtml("sum()");
              editor.fire('saveSnapshot');
            }
          });
          editor.ui.addButton('InsertSigma', {
            label: "Insert Sigma",
            command: 'insertSigma',
            toolbar: 'insert',
            icon: "sigma"
          });

          editor.addCommand("insertProductNotation", {
            exec: function () {
              editor.focus();
              editor.fire('saveSnapshot');
              editor.insertHtml("prod()");
              editor.fire('saveSnapshot');
            }
          });
          editor.ui.addButton('InsertProductNotation', {
            label: "Insert Product Notation",
            command: 'insertProductNotation',
            toolbar: 'insert',
            icon: "pi"
          });

          editor.addCommand("insertPi", {
            exec: function () {
              editor.focus();
              editor.fire('saveSnapshot');
              editor.insertHtml("pi");
              editor.fire('saveSnapshot');
            }
          });
          editor.ui.addButton('InsertPi', {
            label: "Insert Pi",
            command: 'insertPi',
            toolbar: 'insert',
            icon: "lowerCasePi"
          });

        }
      },
      toolbarGroups: [
        { name: 'clipboard', groups: ['clipboard', 'undo'] },
        { name: 'editing', groups: ['find', 'selection', 'editing'] },
        '/',
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
        { name: 'insert', groups: ['insert'] },
        { name: 'others', groups: ['others'] },
      ]
    };

    this.config.removeButtons = 'SpecialChar,Image,Flash,Table,HorizontalRule,Smiley,PageBreak,Iframe,Bold,Italic,Underline,Strike';
    this.config.contentsLangDirection = 'ltr';

  }
  //#endregion setup

  //#region actions
  onSubmit() {
    this.evaluateHiddenEquationString();
    if (!this.ruleForm.get('equation').hasError('evaluationError')) {
      this.rule = new Rule(this.id,
        this.ruleForm.get('name').value,
        this.removeHTMLTags(this.hiddenEquationString || this.ruleForm.get('equation').value),
        this.ruleForm.get('cutoff').value,
        this.ruleForm.get('isActive').value,
        this.ruleForm.get('position').value);

      let rule_array: Rule[] = [];
      rule_array.push(this.rule);
      this.rule = this.sharedService.extractIndexTypes(rule_array, this.index_types)[0];

      if (this.editMode) {
        this.formulaService.updateRule(this.id, this.rule);
      } else {
        const rules = this.formulaService.getRules();
        this.rule.Id = rules ? rules[rules.length - 1].Id + 1 : 0;
        this.rule.Position = this.rule.Id;
        this.formulaService.addRule(this.rule);
      }
      this.onCancel();
    }
  }

  onCancel() {
    this.router.navigate(['/rules'], { relativeTo: this.route });
  }

  onEditorChanged(e) {
    this.hiddenEquationString = '';
    this.writeToHiddenEquationString(this.secureContent(e));
  }
  //#endregion actions

  //#region helpers
  writeToHiddenEquationString(str: string) {
    try {
      this.hiddenEquationString = this.sharedService.writeToHiddenEquationString(str, this.index_types, '');
    }
    catch (e) {
      this.ruleForm.get('equation').setValidators(this.validateSanitizedEditor('indexTypeError'));
    }
    finally {
      this.ruleForm.get('equation').updateValueAndValidity({ emitEvent: false });
    }
  }

  secureContent(e: string) {

    let decoded = this.helperService.decodeEntities(e).replace(/\s+/g, ' ').trim();

    this.sanitizedEditor = this.sanitizer.sanitize(SecurityContext.HTML, decoded);

    if (decoded != this.helperService.decodeEntities(this.sanitizedEditor)) {
      this.ruleForm.get('equation').setValidators(this.validateSanitizedEditor('nonSecuredEditor'));
    }
    else {
      this.ruleForm.get('equation').clearValidators();
    }

    this.ruleForm.get('equation').updateValueAndValidity({ emitEvent: false });

    return decoded;
  }

  evaluateHiddenEquationString() {
    try {
      let regex = /({{.*?}})/ig,
        result = evaluate(this.removeHTMLTags(this.hiddenEquationString.replace(regex, '1')));

      if (result) {
        this.ruleForm.get('equation').clearValidators();
      }
    }
    catch (e) {
      this.ruleForm.get('equation').setValidators(this.validateSanitizedEditor('evaluationError'));
    }
    finally {
      this.ruleForm.get('equation').updateValueAndValidity({ emitEvent: false });

    }
  }

  removeHTMLTags(value) {
    let regex = /(<([^>]+)>)/ig;
    return value.replace(regex, "");
  }
  //#endregion helpers

  //#region validators
  validateSanitizedEditor(error: string) {
    return (control: AbstractControl): { [key: string]: any } | null => {

      if (control.value != "") {
        switch (error) {
          case 'nonSecuredEditor':
            return { 'nonSecuredEditor': true };
          case 'indexTypeError':
            return { 'indexTypeError': true };
          case 'evaluationError':
            return { 'evaluationError': true };
          default:
            return null;
        }
      }

      return null;
    }
  }
  //#endregion validators
}
