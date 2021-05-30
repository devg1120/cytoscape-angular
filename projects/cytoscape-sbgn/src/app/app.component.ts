import { Component, HostListener, OnInit, ViewChild } from '@angular/core'
import { EdgeDefinition, NodeDefinition, Stylesheet } from 'cytoscape'
import * as cytoscape_ from 'cytoscape';

import dagre from 'cytoscape-dagre'
import { CyNodeService } from './cy-node.service'
import { PresetLayoutOptionsImpl, DagreLayoutOptionsImpl , CoseLayoutOptionsImpl, CytoscapeGraphComponent } from 'cytoscape-angular'
import { StylesheetImpl } from '../../../cytoscape-angular/src/lib/style/style'
//import { sbgnStylesheet } from 'cytoscape-sbgn-stylesheet'
import sbgnStylesheet from 'cytoscape-sbgn-stylesheet';

// https://github.com/PathwayCommons/cytoscape-sbgn-stylesheet
//

declare var cytoscape: any

function printt(x: any) {
  console.log(`${typeof(x)} ${Object.prototype.toString.call(x)}`);
  }

@Component({
  selector: 'app-root',
  template: `
    <h2>Cytoscape-Angular SBGN Demo</h2>
    <div style="display: flex;">
      <cytoscape-graph #biggraph title="TGF-beta-Receptor"
                       class="medium-graph"
                       debug="true"
                       showToolbar="true"
                       [nodes]="bigGraphNodes"
                       [edges]="bigGraphEdges"
                       [style]="bigGraphStylesheet"
                       [layoutOptions]="bigGraphLayoutOptions">

      </cytoscape-graph>
      <cytoscape-graph-toolbar [(layoutOptions)]="bigGraphLayoutOptions"
                               [(styles)]="bigGraphStylesheet"
                               [showToolbarButtons]="true"
                               (layoutOptionsChange)="bigGraphLayoutToolbarChange($event)"
                               (stylesChange)="bigGraphLayoutStylesToolbarChange($event)"
                               (styleSelectorChange)="bigGraphLayoutStylesSelectorChange($event)"
                               [nodes]="bigGraphNodes"
                               [edges]="bigGraphEdges"
                               direction="column"
      ></cytoscape-graph-toolbar>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }

      .medium-graph {
        width: 600px;
        height: 600px;
        border: 1px solid rgb(77, 122, 13);
      }
    `
  ]
})
export class AppComponent implements OnInit{
  @ViewChild('biggraph')
  bigGraph: CytoscapeGraphComponent
  //bigGraphLayoutOptions = new CoseLayoutOptionsImpl()
  bigGraphLayoutOptions = new PresetLayoutOptionsImpl()
  bigGraphNodes: NodeDefinition[] = []
  bigGraphEdges: EdgeDefinition[] = []
  bigGraphStylesheet: Stylesheet[] = [new StylesheetImpl()]

  constructor(public cyNodeService: CyNodeService) {
  }

  ngOnInit(): void {
    //cytoscape.use(dagre)
    //let bigChart = 'test1'
    let bigChart = 'sbgn'

    /*
    //let style = sbgnStylesheet(cytoscape_)
    console.log('=================')
    this.dump1(style)
    console.log('=================')
    let style2 = this.convert(style)
    console.log('+++++++++++++++++')
    this.dump2(style2)
    console.log('+++++++++++++++++')
    */

    this.cyNodeService.getStylesheet(bigChart).subscribe(stylesheet => {
      return this.cyNodeService.getData(bigChart).subscribe(result => {
        this.stampNodeAndElementGroupsAndDeleteFields(result, ['curve-style'])
        //this.bigGraphStylesheet = stylesheest.style
        this.bigGraphStylesheet = sbgnStylesheet(cytoscape)
        this.bigGraphNodes = result.elements.nodes
        this.bigGraphEdges = result.elements.edges
      })
    })
  }

  @HostListener('window:beforeunload', ['$event'])
  ngOnDestroy() {
    console.log(`on destroy`)
  }

  private convert(style) {

    let selector_obj_array =[]
     for (let i = 0;  i < style.length; i++) {
        console.dir(style[i].selector)
        const selector_obj = {}
        const style_obj = {}
        for (let p = 0;  p < style[i].properties.length; p++) {
             console.log("   " + style[i].properties[p].name)
             console.log("        " + style[i].properties[p].value)
             style_obj[style[i].properties[p].name] = style[i].properties[p].value
             }
        selector_obj["selector"] = style[i].selector
        selector_obj["style"] = style_obj
        selector_obj_array.push(selector_obj)
     }
     return selector_obj_array

  }
  private dump1(style) {
     console.dir(style)
     //printt(style)
     //console.log(style.length)
     //console.dir(style[0].selector)
     //console.dir(style[1].selector)

     for (let i = 0;  i < style.length; i++) {
        console.dir(style[i].selector)
        for (let p = 0;  p < style[i].properties.length; p++) {
             console.log("   " + style[i].properties[p].name)
             console.log("        " + style[i].properties[p].value)
             }
     }
  }
  private dump2(style) {
     console.dir(style)
     for (let i = 0;  i < style.length; i++) {
        console.log("selector: " + style[i].selector)
        console.log("style: ")
        Object.keys(style[i].style).forEach(function (key) {
            console.log("     key: " + key );
            console.log("     value: " + style[i].style[key]) ;
        });

     }
  }
  private stampNodeAndElementGroupsAndDeleteFields(result, edgeFields: string[]) {
    result.elements.nodes.forEach(node => {
      node.group = 'nodes'
    })
    result.elements.edges.forEach(edge => {
      edge.group = 'edges'
      if (edge.style != null) {
          this.deleteFields(edge.style, edgeFields)
      }
    })
  }

  // Without this called with ['curve-bezier'], you get:
  // core.js:6272 ERROR Error: An element must have a core reference and parameters set
  // at ke (cytoscape.min.js:23)
  // at new Re (cytoscape.min.js:23)
  // at eo.add (cytoscape.min.js:23)
  // at CytoscapeGraphComponent.render (cytoscape-angular.js:86)
  // at CytoscapeGraphComponent.ngOnChanges (cytoscape-angular.js:37)
  // at CytoscapeGraphComponent.wrapOnChangesHook_inPreviousChangesStorage (core.js:27246)
  // at callHook (core.js:4774)
  // at callHooks (core.js:4734)
  // at executeCheckHooks (core.js:4654)
  // at selectIndexInternal (core.js:9729)
  private deleteFields(object, fields: string[]) {
  fields?.forEach(field => delete object[field])
  }

  bigGraphLayoutToolbarChange($event: any) {
    console.log(`app gets big layout toolbar change ${JSON.stringify($event)}`)
    this.bigGraph?.render()
  }

  bigGraphLayoutStylesToolbarChange($event: cytoscape.Stylesheet[]) {
    console.log(`app gets biggraph style toolbar change ${JSON.stringify($event)}`)
    this.bigGraph?.render()
  }

  bigGraphLayoutStylesSelectorChange(selector: string) {
    console.log(`app gets biggraph style selector change: ${JSON.stringify(selector)}`)
    this.bigGraph?.zoomToElement(selector)
  }

}
